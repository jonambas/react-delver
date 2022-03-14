import ts from 'typescript';
import fs from 'fs';

type Raw = {
  raw: true;
};

type NotRaw = {
  raw?: false;
};

export type Config = {
  from?: string[];
  ignoreSubComponents?: boolean;
};

export type Props = {
  value: string | boolean | number;
  name: string;
}[];

export type RawResult = {
  name: string;
  spread?: boolean;
  props?: Props;
  count?: number;
  from?: string;
  location?: ts.LineAndCharacter & {
    file?: string;
  };
};

export type ProcessedResult = {
  name: string;
  count: number;
  instances: RawResult[];
};

type JSXNode = ts.Node & {
  tagName?: ts.JsxTagNameExpression;
  attributes?: ts.JsxAttribute & {
    properties?: ts.JsxAttribute[];
  };
};

type ImportNode = ts.Node & {
  moduleSpecifier?: ts.StringLiteral;
};

type Imports = {
  line: string;
  package?: string;
}[];

function getLoc(node: ts.Node, source: ts.SourceFile) {
  return ts.getLineAndCharacterOfPosition(
    source,
    node.getStart(source)
  );
}

function getFrom(name: string, imports: Imports) {
  const [main, ...r] = name.split('.');
  const importObj = imports.find(({ line }) => line.includes(main));
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
    !imports.some(({ line }) => line.includes(name))
  ) {
    return false;
  }

  return true;
}

function processResults(results: RawResult[]): ProcessedResult[] {
  const processed = results.reduce((acc = [], item) => {
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
  }, [] as ProcessedResult[]);

  return processed;
}

// Storage
const data: RawResult[] = [];

function parse(
  source: ts.SourceFile,
  config: Config = {},
  file: string
) {
  const { from } = config;
  const imports: Imports = [];

  visit(source);

  function visit(node: JSXNode) {
    // Store node so we can reference later
    if (isNodeImport(node)) {
      const importNode: ImportNode = node;
      const text = getImportText(importNode, source);

      // Only include this import node if it is not ignored
      if (!from || from.some((f) => text.includes(f))) {
        imports.push({
          line: text,
          package: importNode.moduleSpecifier?.text
        });
      }
    }

    if (shouldReport({ node, source, config, imports })) {
      const name = getComponentName(node, source);
      const props = node?.attributes?.properties || [];
      let value: string | number | boolean;
      let toSave: Props = [];
      let spread = false;

      props.forEach((prop) => {
        if (isNodeSpread(prop)) {
          spread = true;
          return;
        }

        const propName = prop?.name?.getText(source);
        const initializer = prop.initializer;

        if (!initializer) {
          // Implicit boolean prop set to true
          value = true;
        } else {
          // Includes strings
          if (ts.isStringLiteral(initializer)) {
            value = initializer.text;
          }

          if (ts.isJsxExpression(initializer)) {
            // Numbers
            if (
              initializer.expression &&
              ts.isNumericLiteral(initializer.expression)
            ) {
              value = initializer.expression.text;
            } else {
              // Everything else, variables, functions, etc
              const parts = initializer.getText(source);

              // Removes the opening and closing braces
              const expression = parts.substring(1, parts.length - 1);

              // Removes line breaks and whitespace
              const clean = expression
                .replace('\n', ' ')
                .replace(/\s+/g, ' ');

              // Keep only first 100 characters
              const max = 40;
              value =
                clean.length > max
                  ? `Expression(${clean.substring(0, max)}...)`
                  : `Expression(${clean})`;

              // For some reason I cant check for ts.FalseKeyword
              if (value === 'Expression(false)') {
                value = false;
              }
            }
          }
        }
        toSave.push({ value, name: propName });
      });

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

type ReturnType<T> = T extends Raw ? RawResult[] : ProcessedResult[];
type ConfigArgument = (Config & NotRaw) | (Config & Raw);

/**
 * Analyzes files for React component usage
 * @param files - Array of strings of paths to files
 * @param config - Config options
 */
export function parseReact<T extends ConfigArgument = {}>(
  files: string[],
  config?: T
): ReturnType<T> {
  data.splice(0, data.length);

  files.forEach((file) => {
    const source = ts.createSourceFile(
      file,
      fs.readFileSync(file).toString(),
      ts.ScriptTarget.ES2015
    );
    parse(source, config, file);
  });

  if (config?.raw) {
    return data as ReturnType<T>;
  }

  return processResults(data) as ReturnType<T>;
}
