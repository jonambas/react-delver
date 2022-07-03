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
    "from": "src/file.js",
    "instances": [
      {
        "name": "Bar",
        "spread": false,
        "props": [
          { "value": true, "name": "foo", "expression": true }
        ],
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
    "from": "src/file.js",
    "instances": [
      {
        "name": "Foo",
        "spread": false,
        "props": [
          { "value": "baz", "name": "bar", "expression": false }
        ],
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

const results = delve({ include: 'src/**/*.{jsx,tsx,js,ts}' });
```

<details><summary>Result Type Definitions</summary>
<p>

```ts
type Props = Array<{
  value: string | boolean | number | null | undefined;
  name: string;
  expression: boolean;
}>;

type Instance = {
  name: string;
  spread: boolean;
  props: Props;
  from: string | undefined;
  location: {
    file: string;
    line: number;
    character: number;
  };
};

type Result = {
  name: string;
  count: number;
  from: 'indeterminate' | string | undefined;
  instances: Array<Instance>;
};

type Results = Array<Result>;
```

</p>
</details>

#### `options.include`

Type: `string | string[]`

Array of globs patterns for your React code to parse. See [fast-glob](https://github.com/mrmlnc/fast-glob) for more information.

The node API does not exlude any directories by default, so you may want to specify commonly ignored directories, like `'!**/node_modules'` or `'!**/dist'`.

#### `options.ignoreSubComponents`

Type: `boolean`

Default: `false`

Whether to include subcomponents or not. For example, when set to `true`, `<Foo.Bar />` will be ignored, but `<Foo />` will be included.

#### `options.raw`

Type: `boolean`

Default: `false`

Whether to aggregate the results or not. When set to `true`, data will be a flat array of all component instances.

When set to `false`, data will be grouped by component name and include `count` and `from`. `count` is the total number of component instances. `from` will be either:

- `string` - all component instances were imported from the same package
- `'indeterminate'` - component instances do not share the same import path or package
- `undefined` - all component instances were not imported at all

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
