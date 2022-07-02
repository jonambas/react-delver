import SameFrom from 'package/a';
import DiffFrom from 'package/a';

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
