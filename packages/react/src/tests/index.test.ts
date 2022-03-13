import { parseReact } from '../';

describe('parse', () => {
  describe('inclusion', () => {
    it('includes sub components', () => {
      const result = parseReact(['./tests/inclusion.jsx'], {
        ignoreSubComponents: false
      });
      expect(result[0].name).toBe('Foo');
      expect(result[0].count).toBe(2);
      expect(result[1].name).toBe('Foo.Bar');
      expect(result[1].count).toBe(1);
    });

    it('ignores sub components', () => {
      const result = parseReact(['./tests/inclusion.jsx'], {
        ignoreSubComponents: true
      });
      expect(result[0].name).toBe('Foo');
      expect(result[0].count).toBe(2);
      expect(result.length).toBe(2);
    });

    it('includes only specified packages', () => {
      const result = parseReact(['./tests/inclusion.jsx'], {
        from: ['package/b']
      });
      expect(result[0].name).toBe('Baz');
      expect(result[0].count).toBe(1);
    });
  });

  describe('prop parser', () => {
    it('finds strings', () => {
      const result = parseReact(['./tests/props.jsx'], {});
      const props = result[0].instances[0].props || [];

      expect(props[0].name).toBe('string');
      expect(props[0].value).toBe('string');
    });

    it('finds booleans', () => {
      const result = parseReact(['./tests/props.jsx'], {});
      const props = result[0].instances[0].props || [];

      expect(props[1].name).toBe('implicitTrue');
      expect(props[1].value).toBe(true);

      expect(props[2].name).toBe('false');
      expect(props[2].value).toBe(false);
    });

    it('finds expressions', () => {
      const result = parseReact(['./tests/props.jsx'], {});
      const props = result[0].instances[0].props || [];

      expect(props[3].name).toBe('expression');
      expect(props[3].value).toBe('() => ({})');

      expect(props[4].name).toBe('number');
      expect(props[4].value).toBe('1');
    });
  });

  describe('raw processing', () => {
    it('bypasses processing', () => {
      const result = parseReact(['./tests/inclusion.jsx'], {
        raw: true
      });
      expect(result.length).toBe(4);
      expect(result[0].name).toBe('Foo');
      expect(result[0].count).toBe(undefined);
    });
  });
});
