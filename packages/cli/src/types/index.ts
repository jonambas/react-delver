export type UserConfig = {
  /**
   * React parser config object
   */
  react?: {
    output?: string;
    include?: string;
    ignore?: string | string[];
    ignoreSubComponents?: boolean;
    raw?: boolean;
    expressionLength?: number;
  };
  /**
   * CSS parser config object
   */
  css?: {
    output?: string;
    include?: string;
    ignore?: string | string[];
    properties?: string[];
    evaluateToken?: (line: string, file: string) => boolean;
  };
  /**
   * UI options
   */
  ui?: {
    port?: number;
    output?: string;
    title?: string;
  };
};

export type Config = {
  cwd: string;
  react: {
    output: string;
    include: string;
    ignore?: string | string[];
    ignoreSubComponents?: boolean;
    raw: boolean;
    expressionLength: number;
  };
  css: {
    output: string;
    include: string;
    ignore?: string | string[];
    properties?: string[];
    evaluateToken?: (line: string, file: string) => boolean;
  };
  ui: {
    port: number;
    output: string;
    title: string;
  };
};
