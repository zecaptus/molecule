#!/usr/bin/env node
'use strict';

const { execSync } = require('child_process');

process.on('unhandledRejection', (err) => {
  throw err;
});

const args = process.argv.slice(2);

console.log(args);
execSync('nodemon --inspect ./index.js', { stdio: 'inherit' });
