import { parseCss, DEFAULT_PROPERTIES } from '../';

const css = './testFiles/css.css';
const scss = './testFiles/module.module.scss';

describe('parseCss', () => {
  describe('with default config', () => {
    it('parses a non-token correctly', () => {
      const result = parseCss([css]);
      expect(result[0].code).toBe('color: blue;');
      expect(result[0].token).toBeFalsy();
    });

    it('parses a css variable correctly', () => {
      const result = parseCss([css]);
      expect(result[2].code).toBe('fill: var(--color);');
      expect(result[2].token).toBeTruthy();
    });

    it('parses a scss variable correctly', () => {
      const result = parseCss([scss]);
      expect(result[1].code).toBe('background: $primary;');
      expect(result[1].token).toBeTruthy();
    });

    it('only parses default css properties', () => {
      const result = parseCss([css]);
      expect(result).toHaveLength(3);
    });
  });

  describe('with custom config', () => {
    it('parses additional properties', () => {
      const result = parseCss([css], {
        properties: [...DEFAULT_PROPERTIES, 'margin', 'padding']
      });
      expect(result).toHaveLength(5);
    });

    it('parses a custom evaluator correctly', () => {
      const result = parseCss([scss], {
        properties: ['border-color', 'width'],
        evaluateToken: (line) => {
          const value = line.split(':').pop()?.trim();
          return Boolean(value?.match(/^(?!calc).+(\().+(\))/));
        }
      });
      expect(result[0].token).toBeTruthy();
      expect(result[1].token).toBeFalsy();
    });
  });
});
