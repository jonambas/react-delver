# react-delver

Delver is a React component analysis tool. Delver provides a CLI, Node API, and a standalone environment that can be used or deployed with your component or design system documentation.

---

### CLI Usage

```bash
npx delver
```

Create a `delver.config.js` file to the root directory of your project:

```js
export default {
  // Output path of the results.
  output: 'dist/delve.json',

  // Glob pattern of which files to target
  include: 'src/**/!(*.test|*.spec).@(js|ts)?(x)'

  // Whether to report subcomponents or not
  // When true, `<Foo.Bar />` will be ignored, but `<Foo /> will be included
  ignoreSubComponents: false,

  // Whether or not to proceess the results
  // When false, data will be grouped by component names and include counts
  raw: false,

  // If included, only report components imported from this list of packages
  // Omitting this will bypass this check
  from: ['package/a']
};
```

---

### License

MIT

```

```
