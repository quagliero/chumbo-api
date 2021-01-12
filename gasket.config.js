module.exports = {
  http: 3000,
  plugins: {
    presets: [
      '@gasket/api'
    ],
    add: [
      '@gasket/jest'
    ]
  },
  docs: {
    outputDir: './docs'
  },
  swagger: {
    apiDocsRoute: '/docs',
    jsdoc: {
      definition: {
        basePath: '/api',
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
