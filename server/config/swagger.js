const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerSpec');

const customOptions = {
  customCss: `
    .swagger-ui { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    .swagger-ui .topbar { background-color: #0f172a; padding: 12px 0; border-bottom: 2px solid #3b82f6; }
    .swagger-ui .topbar-wrapper img { content: url('https://img.icons8.com/color/96/school.png'); width: 40px; height: 40px; }
    .swagger-ui .topbar-wrapper .link span { font-weight: 700; color: #f8fafc; font-size: 1.25rem; margin-left: 10px; }
    .swagger-ui .info { margin: 25px 0; }
    .swagger-ui .info .title { color: #1e293b; font-weight: 800; font-size: 2.2rem; }
    .swagger-ui .info p { font-size: 1.05rem; color: #475569; line-height: 1.6; }
    .swagger-ui .scheme-container { background: #f8fafc; border-radius: 12px; padding: 15px; box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.06); }
    .swagger-ui .btn.authorize { color: #2563eb; border-color: #2563eb; border-radius: 8px; font-weight: 600; }
    .swagger-ui .btn.authorize svg { fill: #2563eb; }
    .swagger-ui .opblock { border-radius: 10px; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); border: none !important; margin-bottom: 14px; }
    .swagger-ui .opblock .opblock-summary { border-radius: 10px; padding: 10px 16px; }
    .swagger-ui .opblock.opblock-get { background: rgba(59, 130, 246, 0.05); }
    .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #2563eb; border-radius: 6px; }
    .swagger-ui .opblock.opblock-post { background: rgba(16, 185, 129, 0.05); }
    .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #10b981; border-radius: 6px; }
    .swagger-ui .opblock.opblock-put { background: rgba(245, 158, 11, 0.05); }
    .swagger-ui .opblock.opblock-put .opblock-summary-method { background: #f59e0b; border-radius: 6px; }
    .swagger-ui .opblock.opblock-delete { background: rgba(239, 68, 68, 0.05); }
    .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #ef4444; border-radius: 6px; }
    .swagger-ui .opblock.opblock-patch { background: rgba(139, 92, 246, 0.05); }
    .swagger-ui .opblock.opblock-patch .opblock-summary-method { background: #8b5cf6; border-radius: 6px; }
  `,
  customSiteTitle: 'API Documentation | School ERP System',
  customfavIcon: 'https://img.icons8.com/color/96/school.png',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true
  }
};

const setupSwagger = (app) => {
  // Raw OpenAPI JSON Specification Endpoint
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Interactive Swagger UI endpoints
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, customOptions));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, customOptions));

  console.log('📖 Swagger API Documentation initialized at http://127.0.0.1:5000/api-docs');
};

module.exports = { setupSwagger, swaggerSpec };
