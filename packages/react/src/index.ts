import ts from 'typescript';
import fs from 'fs';
import { logMuted, logError } from '@delver/logger';

type Config = {
  output: string;
  include: string;
  ignore: string[];
  from: string[];
  ignoreSubComponents?: boolean;
};

type JSXNode = ts.Node & {
  tagName?: ts.JsxTagNameExpression;
  attributes?: ts.JsxAttribute & {
    properties?: ts.JsxAttribute[];
  };
};

type Results = {
  name: string;
  spread: boolean;
  location: ts.LineAndCharacter & {
    file: string;
  };
}[];

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
  if (!imports.some((i) => i.includes(name))) {
    return false;
  }

  return true;
}

// Storage
const data: Results = [];

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
      const [name, ...nameParts] = getComponentName(node, source).split('.');
      const props = node?.attributes?.properties || [];
      let value: string | number | boolean;
      let toSave = [];
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
        // props: toSave,
        location: { file, ...getLoc(node, source) }
      });
    }

    ts.forEachChild(node, visit);
  }
}

export default function parseFiles(files: string[], config: Config) {
  logMuted(`Parsing ${files.length} files.`);

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

    return data;
  } catch (error) {
    logError(`${error}`);
    process.exit(1);
  }
}
