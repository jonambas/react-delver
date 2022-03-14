import fs from 'fs';

export const DEFAULT_PROPERTIES = [
  'color',
  'background',
  'background-color',
  'fill',
  'stroke',
  'border-color',
  'border-left-color',
  'border-right-color',
  'border-top-color',
  'border-bottom-color'
];

function defaultEvaluateToken(line: string, file: string): boolean {
  const value = line.split(':').pop()?.trim();
  const isCssVariable = Boolean(value?.match(/^var\(--/));
  const isScssVariable = Boolean(value?.match(/^\$/));
  return isCssVariable || isScssVariable;
}

function isProperty(line: string, properties: string[]): boolean {
  if (properties.some((property) => line.match(`^${property}:`))) {
    return true;
  }
  return false;
}

type Config = {
  /**
   * List of CSS properties to include.
   */
  properties?: string[];
  /**
   * Custom function to determine if a single line is a token or not.
   * Return `true` for for tokens, and `false` for non-tokens.
   */
  evaluateToken?: (line: string, file: string) => boolean;
};

type StyleObject = {
  code: string;
  token: boolean;
  location: {
    file: string;
    line: number;
  };
};

/**
 * Analyzes files for CSS usage
 * @param files - Array of strings of paths to files
 * @param config - Config options
 */
export function parseCss(
  files: string[],
  config: Config = {}
): StyleObject[] {
  // Collects CSS properties to include from the user's config
  // Defaults to DEFAULT_PROPERTIES
  const propertiesToInclude = config.properties || DEFAULT_PROPERTIES;

  // Function to determine if a line is a token or not
  const evaluateTokenFunc =
    config.evaluateToken || defaultEvaluateToken;

  const results = files.reduce((acc: StyleObject[], file: string) => {
    const content = fs.readFileSync(file, 'utf8');
    const allLines = content.split('\n');

    const styleLines = allLines.reduce(
      (bcc: StyleObject[], line: string, i: number) => {
        // Trims whitespace
        const trimmed = line.trim();

        if (!isProperty(trimmed, propertiesToInclude)) {
          return bcc;
        }

        bcc.push({
          code: trimmed,
          token: evaluateTokenFunc(trimmed, file),
          location: {
            file: file.split('/').pop() || '',
            line: i
          }
        });

        return bcc;
      },
      []
    );

    return [...acc, ...styleLines];
  }, []);

  return results;
}
