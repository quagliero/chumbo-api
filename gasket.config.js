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
  terminus: {
    healthcheck: '/api/healthcheck'
  },
  swagger: {
    apiDocsRoute: '/api/docs',
    jsdoc: {
      definition: {
        basePath: '/api/v1',
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
