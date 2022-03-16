/** @type {import("@delver/cli").DelverConfig } */
module.exports = {
  react: {
    output: 'dist/react.json',
    include: 'src/**/!(*.test|*.spec).@(js|ts)?(x)'
    // ignoreSubComponents: false,
    // raw: false,
    // from: ['package/a']
  },
  css: {
    output: 'dist/css.json',
    include: 'src/**/*.?(s)css'
  }
};
