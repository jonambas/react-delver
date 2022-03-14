import { Foo } from 'package/a';
import { Bar } from 'package/b';
import Baz from 'package/c';

function App() {
  return (
    <>
      <Foo.Sub
        foo="bar"
        implicit
        false={false}
        func={() => ({})}
        {...spread}
      ></Foo.Sub>
      <Bar foo="bar"></Bar>
      <Baz
        foo
        expression={() => {
          console.log(
            'this is an example with line breaks and white space'
          );
        }}
      />
    </>
  );
}

export default App;
