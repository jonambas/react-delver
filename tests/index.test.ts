import { delve } from '../src';

const inclusionGlob = './tests/files/inclusion.jsx';
const propsGlob = './tests/files/props.jsx';
const from1Glob = './tests/files/from1.jsx';
const from2Glob = './tests/files/from2.jsx';

describe('delve', () => {
  describe('inclusion', () => {
    it('includes sub components', () => {
      const result = delve({
        include: inclusionGlob,
        ignoreSubComponents: false
      });
      expect(result[0].name).toBe('Foo');
      expect(result[0].count).toBe(2);
      expect(result[1].name).toBe('Foo.Bar');
      expect(result[1].count).toBe(1);
    });

    it('ignores sub components', () => {
      const result = delve({
        include: inclusionGlob,
        ignoreSubComponents: true
      });
      expect(result[0].name).toBe('Foo');
      expect(result[0].count).toBe(2);
      expect(result.length).toBe(2);
    });

    it('includes only specified packages', () => {
      const result = delve({
        include: inclusionGlob,
        from: ['package/b']
      });
      expect(result[0].name).toBe('Baz');
      expect(result[0].count).toBe(1);
    });
  });

  describe('prop parser', () => {
    it('finds strings', () => {
      const result = delve({ include: propsGlob });
      const props = result[0].instances[0].props || [];

      expect(props[0].name).toBe('string');
      expect(props[0].value).toBe('string');
      expect(props[0].expression).toBe(false);
    });

    it('finds booleans', () => {
      const result = delve({ include: propsGlob });
      const props = result[0].instances[0].props || [];

      expect(props[1].name).toBe('implicitTrue');
      expect(props[1].value).toBe(true);
      expect(props[1].expression).toBe(true);

      expect(props[2].name).toBe('false');
      expect(props[2].value).toBe(false);
      expect(props[2].expression).toBe(true);
    });

    it('finds expressions', () => {
      const result = delve({ include: propsGlob });
      const props = result[0].instances[0].props || [];

      expect(props[3].name).toBe('expression');
      expect(props[3].value).toBe(`() => { console.log('test'); }`);
      expect(props[3].expression).toBe(true);

      expect(props[4].name).toBe('longExpression');
      expect(props[4].value).toBe(
        `() => { console.log('Lorem ipsum dolor s...`
      );
      expect(props[4].expression).toBe(true);

      expect(props[5].name).toBe('number');
      expect(props[5].value).toBe('1');
      expect(props[5].expression).toBe(true);
    });
  });

  describe('location', () => {
    it('returns location', () => {
      const result = delve({
        include: inclusionGlob,
        raw: true
      });
      expect(result[0].location.line).toBe(6);
      expect(result[0].location.character).toBe(6);
      expect(result[0].location.file).toBe(
        './tests/files/inclusion.jsx'
      );
    });
  });

  describe('raw processing', () => {
    it('bypasses processing', () => {
      const result = delve({
        include: inclusionGlob,
        raw: true
      });
      expect(result.length).toBe(4);
      expect(result[0].name).toBe('Foo');
    });
  });

  describe('imports', () => {
    it('collects instance imports correctly', () => {
      const result = delve({
        include: inclusionGlob
      });
      expect(result[0].instances[0].from).toBe('package/a');
      expect(result[1].instances[0].from).toBe('package/a');
      expect(result[2].instances[0].from).toBe('package/b');
    });

    it('collects aggregated imports correctly', () => {
      const result = delve({
        include: [from1Glob, from2Glob]
      });
      expect(result[0].from).toBe('package/a');
      expect(result[0].name).toBe('SameFrom');

      expect(result[1].from).toBe('indeterminate');
      expect(result[1].name).toBe('DiffFrom');

      expect(result[2].from).toBeUndefined();
      expect(result[2].name).toBe('NoFrom');

      expect(result[3].from).toBe('indeterminate');
      expect(result[3].name).toBe('DiffNoFrom');
    });
  });
});
