/*module.exports = {
  // config for a library is scoped under "dependency" key
  dependency: {
    assets: ['assets/fonts'], // stays the same
  },
}*/

module.exports = {
  project: {
    ios: {},
    android: {
        packageName: 'info.inprov.drip',
    },
  },
  assets: ['./assets/fonts'],
};