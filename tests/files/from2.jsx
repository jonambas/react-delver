import SameFrom from 'package/a';
import DiffFrom from 'package/b';
import DiffNoFrom from 'package/c';

function Component() {
  return (
    <>
      <SameFrom />
      <DiffFrom />
      <NoFrom />
      <DiffNoFrom />
    </>
  );
}
