/**
 * Handle log with spinner and
 * the ability to update the text.
 * @module AsyncLogger
 *
 * @typedef {Object} LoggerOptions
 * @property {String} prefix=''
 * @property {Boolean} startImmediatly=true
 * @property {Spinner} spinner=spinner
 * @property {Function} customLogger=console.log
 *
 * @typedef {Object} Spinner
 * @property {Number} interval
 * @property {Array.<String>} frames
 */

const isInteractive = process.stdout.isTTY;

const spinner = {
  interval: 80,
  frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
};

type Logger = typeof console.log;

export type AsyncLoggerOptions = {
  prefix?: string;
  startImmediatly?: boolean;
  spinner?: typeof spinner;
  logger?: Logger;
};

class AsyncLogger {
  text: string;

  prefix: string;
  startImmediatly: boolean;
  spinner: typeof spinner;
  customLogger: Logger;
  logger: Logger | undefined;

  timer: NodeJS.Timeout | undefined;

  /**
   * @constructor
   * @param {String} text text to log
   * @param {LoggerOptions} options options
   */
  constructor(text: string, options: AsyncLoggerOptions = {}) {
    this.text = text;

    // > options
    this.prefix = options.prefix ?? '';
    this.startImmediatly = options.startImmediatly ?? true;
    this.spinner = options.spinner ?? spinner;
    this.customLogger = options.logger ?? console.log;
    // < options

    this.log(this.text);

    if (this.startImmediatly) this.start();
  }

  log(...args: any[]) {
    if (isInteractive) {
      if (!this.logger) this.logger = console.draft(this.prefix, ...args);
      else this.logger(this.prefix, ...args);
    } else {
      this.customLogger(this.prefix, ...args);
    }
  }

  update(text: string) {
    this.text = text;
    this.log(text);
  }

  start() {
    if (!isInteractive) return this.log('-> ', this.text);
    const { frames, interval } = this.spinner;

    let cpt = 0;
    this.timer = setInterval(() => {
      cpt++;
      this.log(frames[cpt % frames.length], this.text);
    }, interval);
  }

  clear(text = this.text) {
    if (isInteractive) {
      this.log(text);
      clearInterval(this.timer);
    } else {
      this.log('<- ', text);
    }
  }
}

export default AsyncLogger;
