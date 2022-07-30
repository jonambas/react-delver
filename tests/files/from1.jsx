import SameFrom from 'package/a';
import DiffFrom from 'package/a';
import Excluded from 'package/a-excluded';

function Component() {
  return (
    <>
      <SameFrom />
      <DiffFrom />
      <NoFrom />
      <DiffNoFrom />
      <Excluded />
    </>
  );
}
