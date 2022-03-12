import { Foo } from 'package/a';
import { Bar } from 'package/b';
import Baz from 'package/c';

function App() {
  return (
    <>
      <Foo foo="bar">
        <Foo />
      </Foo>
      <Bar foo="bar"></Bar>
      <Baz foo />
    </>
  );
}

export default App;
