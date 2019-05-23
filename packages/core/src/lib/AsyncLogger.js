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

class AsyncLogger {
  /**
   * @constructor
   * @param {String} text text to log
   * @param {LoggerOptions} options options
   */
  constructor(text, options = {}) {
    this.text = text;

    // > options
    this.prefix = options.prefix || '';
    this.startImmediatly = options.startImmediatly || true;
    this.spinner = options.spinner || spinner;
    this.customLogger = options.loggger || console.log;
    // < options

    this.log(this.text);

    if (this.startImmediatly) this.start();
  }

  log(...args) {
    if (isInteractive) {
      if (!this.logger) this.logger = console.draft(this.prefix, ...args);
      else this.logger(this.prefix, ...args);
    } else {
      this.customLogger(this.prefix, ...args);
    }
  }

  update(text) {
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

module.exports = AsyncLogger;
