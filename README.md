# react-delver

`react-delver` is a React component analysis tool. Delver provides a CLI, Node API, and a standalone environment that can be used or deployed with your component or design system documentation.

`react-delver` will turn:

```js
function App() {
  return (
    <Foo bar="baz">
      <Bar foo />
    </Foo>
  );
}
```

into this:

```json
[
  {
    "name": "Bar",
    "count": 1,
    "instances": [
      {
        "name": "Bar",
        "spread": false,
        "props": [{ "value": true, "name": "foo" }],
        "location": { "file": "src/file.js", "line": 8, "character": 6 }
      }
    ]
  },
  {
    "name": "Foo",
    "count": 1,
    "instances": [
      {
        "name": "Foo",
        "spread": false,
        "props": [{ "value": "baz", "name": "bar" }],
        "location": { "file": "src/file.js", "line": 7, "character": 6 }
      }
    ]
  }
]
```

---

## CLI Usage

Run delver via the command line:

```bash
npx @delver/cli
```

To configure options, create a `delver.config.js` file to the root directory of your project:

```js
export default {
  // Output path of the results.
  output: 'dist/delve.json',

  // Glob pattern of which files to target
  include: 'src/**/!(*.test|*.spec).@(js|ts)?(x)'

  // Whether to report subcomponents or not
  // When true, `<Foo.Bar />` will be ignored, but `<Foo />` will be included
  ignoreSubComponents: false,

  // Whether or not to proceess the results
  // When false, data will be grouped by component names and include counts
  raw: false,

  // If included, only report components imported from this list of packages
  // Omitting this will bypass this check
  from: ['package/a']
};
```

## Node Usage

Delver offers a Node API

```bash
npm i @delver/react --save-dev
```

```js
import { parseFiles } from '@delver/react';

const results = parseFiles(files, options);
```

### `files`

Type: `string[]`

Array of file paths to parse.

### `options`

#### `options.ignoreSubComponents`

Type: `boolean`

Default: `false`

Whether to include subcomponents or not. For example, when set to `true`, `<Foo.Bar />` will be ignored, but `<Foo />` will be included.

#### `options.raw`

Type: `boolean`

Default: `false`

Whether to aggregate the results or not. When set to `false`, data will be grouped by component display name and include component `count`. When set to `true`, data will include an array of every component instance.

#### `options.from`

Type: `string[]`

If included, only include components that are imported from this list of packages. Omitting this will bypass this check.

---

### License

MIT
