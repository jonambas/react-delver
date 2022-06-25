import { Foo } from 'package/a';
import { Baz } from 'package/b';

function Component() {
  return (
    <>
      <Foo></Foo>
      <Foo />
      <Foo.Bar />
      <Baz />
    </>
  );
}
