# react-delver

`react-delver` is a design system analysis tool. Delver provides a CLI, Node API, and a standalone environment that can be used or deployed with your component or design system documentation.

`react-delver` can parse JSX, and will turn:

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
        "location": {
          "file": "src/file.js",
          "line": 8,
          "character": 6
        }
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
        "location": {
          "file": "src/file.js",
          "line": 7,
          "character": 6
        }
      }
    ]
  }
]
```

---

## CLI Usage

Install via the command line:

```bash
npm i @delver/cli --save-dev
```

Then, configure options by creating a `delver.config.js` file to the root directory of your project:

```js
export default {
  react: {
    // Output path of the results.
    output: 'dist/react.json',

    // Glob pattern of which files to target
    include: 'src/**/!(*.test|*.spec).@(js|ts)?(x)'

    // Whether to report subcomponents or not
    // When true, `<Foo.Bar />` will be ignored, but `<Foo />` will be included
    ignoreSubComponents: false,

    // If included, only report components imported from this list of packages
    // Omitting this will bypass this check
    from: ['package/a']
  },
  css: {
    // Output path of the results.
    output: 'dist/css.json',

    // Glob pattern of which files to target
    include: 'src/**/*.?(s)css',

    // Array of CSS properties to include
    properties: ['color', 'background', 'background-color', 'fill', 'stroke']

    // Pass in a custom design token evaluator
    // By default, all CSS and SCSS variables will be treated as tokens
    // Returning `true` will mark this line as a token in results
    evaluateToken: (line: string, file: string) => boolean
  }
};
```

And finally, run `react-delve`:

```bash
# Runs the React parser
delve react

# Runs the CSS parser
delve css
```

## `@delver/react` Node Usage

Delver offers a Node API

```bash
npm i @delver/react --save-dev
```

```js
import { parseReact } from '@delver/react';

const results = parseReact(files, options);
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

### Limitations

`react-delver` uses typescript's compiler API to parse through your JSX.

- Components will only be detected when explicitly rendered with JSX, ie `<MyComponent />`.
- Components may not accurately represent their `displayName` if they are aliased or renamed.
- Prop values that contain expressions such as variables or functions are not evaluated, but are stringified and truncated.

### License

MIT
