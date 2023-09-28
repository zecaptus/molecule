import { version } from '../../package.json';
import AsyncLogger from '../lib/AsyncLogger';
import { red, italic } from 'chalk';
import gradient from 'gradient-string';
import { choosePort } from './port';

const isInteractive = process.stdout.isTTY;

function moleculeGradient(text: string) {
  return gradient('#61affe', 'white')(text);
}

function sign() {
  console.clear();
  console.log('');
  console.log(
    gradient('#61affe', 'white').multiline(
      [
        '              __             __   ',
        '  __ _  ___  / /__ ______ __/ /__ ',
        " /  ' \\/ _ \\/ / -_) __/ // / / -_)",
        '/_/_/_/\\___/_/\\__/\\__/\\_,_/_/\\__/ ',
        `_________________________________v${version}`,
      ].join('\n'),
    ),
  );
  console.log('');
  const info = new AsyncLogger(moleculeGradient('Booting'));
  console.log(italic(moleculeGradient('\nℹ type `rs` to reload at anytime')));
  console.log(moleculeGradient('________________________________________'));
  console.log('');

  return info;
}

async function boot(port: number) {
  let info = sign();

  info.update(`checking port: ${port}`);
  info.clear();
  const _port = await choosePort(port);

  if (isInteractive && port !== _port) {
    info = sign();
  }

  if (!_port) {
    info.update(red("Can't start molecule"));
    process.exit(1);
  }

  return { info, port: _port };
}

export default boot;
