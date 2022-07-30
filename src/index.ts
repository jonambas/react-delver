import ts from 'typescript';
import fs from 'fs';
import fg from 'fast-glob';

type Raw = {
  /**
   * Components will not be grouped by their name if set to `true`
   */
  raw: true;
};

type NotRaw = {
  /**
   * Components will not be grouped by their name if set to `true`
   */
  raw?: false;
};

type Options = {
  /**
   * Glob pattern(s) to include
   */
  include: string | Array<string>;
  /**
   * Only include components from these imports
   * @example ['src/components', '@my/library']
   */
  from?: Array<string>;
  /**
   * Ignores sub-components if true, eg `<Foo.Bar />`
   */
  ignoreSubComponents?: boolean;
  /**
   * Truncates JS expressions in props to this length
   * @default 40
   */
  expressionLength?: number;
  /**
   * Components will not be grouped by their name if set to `true`
   * @default false
   */
  raw?: boolean;
};

type Prop = {
  value: string | boolean | number | null | undefined;
  name: string;
  expression: boolean;
};

export type Props = Array<Prop>;

export type Instance = {
  name: string;
  spread: boolean;
  props: Props;
  from?: string;
  location: {
    file: string;
    line: number;
    character: number;
  };
};

export type Result = {
  name: string;
  count: number;
  from?: 'indeterminate' | string;
  instances: Array<Instance>;
};

type WithoutFromResult = Omit<Result, 'from'>;

type JSXNode = ts.Node & {
  tagName?: ts.JsxTagNameExpression;
  attributes?: ts.JsxAttribute & {
    properties?: ts.JsxAttribute[];
  };
};

type ImportNode = ts.Node & {
  moduleSpecifier?: ts.StringLiteral;
};

type Imports = Array<{
  line: string;
  package?: string;
}>;

function getLoc(node: ts.Node, source: ts.SourceFile) {
  return ts.getLineAndCharacterOfPosition(
    source,
    node.getStart(source)
  );
}

function isComponentInLine(name: string, line: string) {
  const [main] = name.split('.');
  return line.match(`\\b${main}\\b`);
}

function getFrom(name: string, imports: Imports) {
  const importObj = imports.find(({ line }) =>
    isComponentInLine(name, line)
  );

  return importObj?.package;
}

function isNodeComponent(node: ts.Node) {
  return (
    node.kind === ts.SyntaxKind.JsxOpeningElement ||
    node.kind === ts.SyntaxKind.JsxSelfClosingElement
  );
}

function isNodeImport(node: ts.Node) {
  return node.kind === ts.SyntaxKind.ImportDeclaration;
}

function isNodeSpread(node: ts.Node) {
  return node.kind === ts.SyntaxKind.JsxSpreadAttribute;
}

function getComponentName(node: JSXNode, source: ts.SourceFile) {
  return node?.tagName?.getText(source) || '';
}

function isFragment(name: string) {
  return !/[A-Z]/.test(name[0]);
}

function getImportText(node: ts.Node, source: ts.SourceFile) {
  return node?.getText(source);
}

function shouldReport({
  node,
  source,
  config,
  imports
}: {
  node: JSXNode;
  source: ts.SourceFile;
  config: Config;
  imports: Imports;
}) {
  // This node isn't a component
  if (!isNodeComponent(node)) {
    return false;
  }

  const [name, ...nameParts] = getComponentName(node, source).split(
    '.'
  );

  // Ignore fragments
  if (isFragment(name)) {
    return false;
  }

  // Ignore subcomponents depending on user's config
  if (config.ignoreSubComponents && nameParts.length) {
    return false;
  }

  // Check if this component is in stored imports
  if (
    config.from &&
    !imports.some(({ line }) => isComponentInLine(name, line))
  ) {
    return false;
  }

  return true;
}

const withFrom = (
  processed: Array<WithoutFromResult>
): Array<Result> => {
  return processed.reduce(
    (acc = [], component: WithoutFromResult) => {
      const { instances, ...rest } = component;

      const firstFrom = instances[0].from;
      const sameFrom = instances.every((v) => v.from === firstFrom);

      acc.push({
        ...rest,
        instances,
        from: sameFrom ? firstFrom : 'indeterminate'
      });
      return acc;
    },
    [] as Array<Result>
  );
};

function groupByName(
  results: Array<Instance>
): Array<WithoutFromResult> {
  const processed = results.reduce((acc = [], item: Instance) => {
    const index = acc.findIndex((n) => n.name === item.name);

    if (index !== -1) {
      acc[index].count = acc[index].count + 1;
      acc[index].instances.push(item);
      return acc;
    }

    acc.push({
      name: item.name,
      count: 1,
      instances: [item]
    });

    return acc;
  }, [] as Array<WithoutFromResult>);

  return processed;
}

function getPropValue(
  prop: ts.JsxAttribute,
  source: ts.SourceFile,
  expressionLength: Config['expressionLength'] = 40
): Prop['value'] {
  const initializer = prop.initializer;

  // Implicit boolean prop set to true
  if (!initializer) {
    return true;
  }

  // Includes strings
  if (ts.isStringLiteral(initializer)) {
    return initializer.text;
  }

  if (initializer.expression && ts.isJsxExpression(initializer)) {
    const kind = initializer.expression.kind;

    if (ts.isNumericLiteral(initializer.expression)) {
      // Numbers
      return Number(initializer.expression.text);
    } else if (kind === ts.SyntaxKind.NullKeyword) {
      // Null
      return null;
    } else if (kind === ts.SyntaxKind.FalseKeyword) {
      // False
      return false;
    } else if (kind === ts.SyntaxKind.TrueKeyword) {
      // Explicit
      return true;
    } else {
      // Everything else, variables, functions, etc
      const parts = initializer.getText(source);

      // Removes the opening and closing braces
      const expression = parts.substring(1, parts.length - 1);

      // Removes line breaks and whitespace
      const clean = expression
        .replace('\n', ' ')
        .replace(/\s+/g, ' ');

      if (clean === 'undefined') {
        return undefined;
      }

      // Truncate expressions to config length
      return clean.length > expressionLength
        ? `${clean.substring(0, expressionLength)}...`
        : `${clean}`;
    }
  }

  // If you're hitting this, I missed some cases
  return '';
}

function getIsExpression(prop: ts.JsxAttribute): boolean {
  const initializer = prop.initializer;
  if (
    initializer &&
    !ts.isStringLiteral(initializer) &&
    initializer.expression &&
    ts.isJsxExpression(initializer)
  ) {
    return true;
  }
  return false;
}

// Storage
const data: Array<Instance> = [];

function parse(source: ts.SourceFile, config: Config, file: string) {
  const { from, expressionLength } = config;
  const imports: Imports = [];

  visit(source);

  function visit(node: JSXNode) {
    // Store node so we can reference later
    if (isNodeImport(node)) {
      const importNode: ImportNode = node;
      const text = getImportText(importNode, source);
      const fromText = importNode.moduleSpecifier?.text;

      // Only include this import node if it is not ignored
      if (!from || from.some((f) => fromText === f)) {
        imports.push({
          line: text,
          package: fromText
        });
      }
    }

    if (shouldReport({ node, source, config, imports })) {
      const name = getComponentName(node, source);
      const props = node?.attributes?.properties || [];
      const toSave: Props = [];
      let spread = false;

      for (const prop of props) {
        if (isNodeSpread(prop)) {
          spread = true;
          continue;
        }

        toSave.push({
          name: prop.name.getText(source),
          value: getPropValue(prop, source, expressionLength),
          expression: getIsExpression(prop)
        });
      }

      data.push({
        name,
        spread,
        props: toSave,
        from: getFrom(name, imports),
        location: { file, ...getLoc(node, source) }
      });
    }

    ts.forEachChild(node, visit);
  }
}

type Results<T> = T extends Raw ? Array<Instance> : Array<Result>;

export type Config = (Options & Raw) | (Options & NotRaw);

/**
 * Analyzes files for React component usage
 * @see https://github.com/jonambas/react-delver
 */
export function delve<TOptions extends Config>(
  config: TOptions
): Results<TOptions> {
  data.splice(0, data.length);

  const files = fg.sync(config.include);

  for (const file of files) {
    const source = ts.createSourceFile(
      file,
      fs.readFileSync(file).toString(),
      ts.ScriptTarget.ESNext
    );
    parse(source, config, file);
  }

  if (config?.raw) {
    return data as Results<TOptions>;
  }

  return withFrom(groupByName(data)) as Results<TOptions>;
}
