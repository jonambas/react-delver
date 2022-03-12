import ts from 'typescript';
import fs from 'fs';
import { logMuted, logError } from './log.js';

function getLoc(node, source) {
  return ts.getLineAndCharacterOfPosition(source, node.getStart(source));
}

function isNodeComponent(node) {
  return (
    node.kind === ts.SyntaxKind.JsxOpeningElement ||
    node.kind === ts.SyntaxKind.JsxSelfClosingElement
  );
}

function isNodeImport(node) {
  return node.kind === ts.SyntaxKind.ImportDeclaration;
}

function isNodeSpread(node) {
  return node.kind === ts.SyntaxKind.JsxSpreadAttribute;
}

function getComponentName(node, source) {
  return node?.tagName?.getText(source);
}

function isFragment(name) {
  return !/[A-Z]/.test(name[0]);
}

function getImportText(node, source) {
  return node?.getText(source);
}

function shouldReport({ node, source, config, imports }) {
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
const data = [];

function parse(source, config, file) {
  const { from } = config;
  const imports = [];

  visit(source);

  function visit(node) {
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

      const props = node.attributes.properties || [];
      let value = '__uknown';
      let toSave = [];
      let spread = false;

      props.forEach((prop) => {
        if (isNodeSpread(prop)) {
          spread = true;
          return;
        }

        const propName = prop.name.getText(source);
        const valueNode = prop.initializer;

        if (!valueNode) {
          // Implicit boolean prop set to true
          value = true;
        } else {
          if (valueNode.text) {
            // Includes strings
            value = valueNode.text;
          } else if (valueNode.expression && valueNode.expression.text) {
            // Numbers
            value = valueNode.expression.text;
          } else {
            // Everything else, variables, functions, etc
            const parts = valueNode.getText(source);

            // Removes the opening and closing braces
            const expression = parts.substring(1, parts.length - 1);

            // Keep only first 200 characters
            const max = 200;
            value = expression.length > max ? `${expression.substring(0, max)}...` : expression;

            if (value === 'false') {
              value = false;
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

function parseFiles(files, config) {
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
    logError(error);
    process.exit(1);
  }
}

export default parseFiles;
