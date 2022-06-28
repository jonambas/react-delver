# react-delver

`react-delver` is a design system analysis tool and provides a Node API to analyze your app's JSX.

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

## Node API

```bash
npm i react-delver --save-dev
```

```js
const { delve } = require('react-delver');

const results = delve(options);
```

#### `options.include`

Type: `string | string[]`

Array of globs patterns for your React code to parse. See [fast-glob](https://github.com/mrmlnc/fast-glob) for more information.

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

#### `options.expressionLength`

Type: `number`

Default: `40`

Truncates JS expressions detected in props to this length.

---

### Limitations

`react-delver` uses typescript's compiler API to parse through your JSX.

- Components will only be detected when explicitly rendered with JSX, ie `<MyComponent />`.
- Components may not accurately represent their `displayName` if they are aliased or renamed.
- Prop values that contain expressions such as variables or functions are not evaluated, but are stringified and truncated.

### License

MIT
