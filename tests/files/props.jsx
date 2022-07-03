function Component() {
  return (
    <>
      <Foo
        string="string"
        implicitTrue
        false={false}
        expression={() => {
          console.log('test');
        }}
        longExpression={() => {
          console.log('Lorem ipsum dolor sit amet');
        }}
        number={1}
        null={null}
        undefined={undefined}
        explicitTrue={true}
      />
    </>
  );
}
