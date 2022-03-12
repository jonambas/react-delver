import ts from 'typescript';
import fs from 'fs';
import { logMuted, logError } from '@delver/logger';
import processResults from './process';

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

type Imports = string[];

function getLoc(node: ts.Node, source: ts.SourceFile) {
  return ts.getLineAndCharacterOfPosition(source, node.getStart(source));
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
  imports: string[];
}) {
  // This node isn't a component
  if (!isNodeComponent(node)) {
    return false;
  }

  const [name, ...nameParts] = getComponentName(node, source).split('.');

  // Ignore fragments
  if (isFragment(name)) {
    return false;
  }

  // Ignore subcomponents depending on user's config
  if (config.ignoreSubComponents && nameParts.length) {
    return false;
  }

  // Check if this component is in stored imports
  if (config.from && !imports.some((i) => i.includes(name))) {
    return false;
  }

  return true;
}

// Storage
const data: RawResult[] = [];

function parse(source: ts.SourceFile, config: Config, file: string) {
  const { from } = config;
  const imports: Imports = [];

  visit(source);

  function visit(node: JSXNode) {
    // Store node so we can reference later
    if (isNodeImport(node)) {
      const text = getImportText(node, source);

      // Only include this import node if it is not ignored
      if (!from || from.some((f) => text.includes(f))) {
        imports.push(text);
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
            if (initializer.expression && ts.isNumericLiteral(initializer.expression)) {
              value = initializer.expression.text;
            } else {
              // Everything else, variables, functions, etc
              const parts = initializer.getText(source);

              // Removes the opening and closing braces
              const expression = parts.substring(1, parts.length - 1);

              // Keep only first 200 characters
              const max = 200;
              value = expression.length > max ? `${expression.substring(0, max)}...` : expression;

              // For some reason I cant check for ts.FalseKeyword
              if (value === 'false') {
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
        location: { file, ...getLoc(node, source) }
      });
    }

    ts.forEachChild(node, visit);
  }
}

type ReturnType<T> = T extends Raw ? RawResult[] : ProcessedResult[];
type ConfigArgument = (Config & Raw) | (Config & NotRaw);

/**
 * Analyzes files for React component usage
 * @param files - Array of strings of paths to files
 * @param config - Config options
 */
export default function parseFiles<T extends ConfigArgument>(
  files: string[],
  config: T
): ReturnType<T> {
  logMuted(`Parsing ${files.length} files.`);
  data.splice(0, data.length);

  try {
    files.forEach((file) => {
      const source = ts.createSourceFile(
        file,
        fs.readFileSync(file).toString(),
        ts.ScriptTarget.ES2015
      );
      parse(source, config, file);
    });

    logMuted(`Found ${data.length} components.`);

    if (config.raw) {
      return data as ReturnType<T>;
    }

    return processResults(data) as ReturnType<T>;
  } catch (error) {
    logError(`${error}`);
    process.exit(1);
  }
}
