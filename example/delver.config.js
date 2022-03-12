export default {
  output: 'dist/delve.json',
  include: 'src/**/!(*.test|*.spec).@(js|ts)?(x)'
  // ignoreSubComponents: false,
  // raw: false,
  // from: ['package/a']
};
