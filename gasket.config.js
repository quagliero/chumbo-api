module.exports = {
  plugins: {
    presets: [
      '@gasket/api'
    ],
    add: [
      '@gasket/jest'
    ]
  },
  swagger: {
    jsdoc: {
      definition: {
        info: {
          title: 'chumbo-api',
          version: '1.0.0'
        }
      },
      apis: [
        './routes/*'
      ]
    }
  },
  express: {
    routes: './routes/*'
  }
}
