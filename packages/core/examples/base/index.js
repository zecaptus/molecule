const molecule = require('../../src');

(async () => {
  const app = await molecule.createApp({
    api: './api.yml',
  });

  // await app.addDoc('./doc.yml');

  app.start();
})();
