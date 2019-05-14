const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

function koaSwagger(routePrefix, options = {}) {
  Handlebars.registerHelper('json', context => JSON.stringify(context));
  Handlebars.registerHelper('strfnc', fnc => fnc);
  Handlebars.registerHelper('isset', function(conditional, opt) {
    return conditional ? opt.fn(this) : opt.inverse(this);
  });

  const index = Handlebars.compile(
    fs.readFileSync(path.join(__dirname, './build/index.html'), 'utf-8'),
  );
  return function koaSwaggerUi(ctx, next) {
    if (routePrefix === false || ctx.path === routePrefix) {
      console.log(options);
      ctx.type = 'text/html';
      ctx.body = index({ swaggerOptions: options });
      return true;
    }

    if (ctx.path.startsWith('/static/') || ctx.path === '/manifest.json') {
      const filePath = `./build${ctx.path}`;
      switch (path.parse(filePath).ext) {
        case '.js':
          ctx.type = 'text/javascript';
          break;
        case '.json':
          ctx.type = 'application/json';
          break;
        case '.css':
          ctx.type = 'text/css';
          break;
        case '.svg':
          ctx.type = 'image/svg+xml';
          break;
      }
      ctx.body = fs.createReadStream(path.join(__dirname, filePath));
    }

    return next();
  };
}

module.exports = koaSwagger;
