"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
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
        var _a, _b, _c, _d;
        this.text = text;
        // > options
        this.prefix = (_a = options.prefix) !== null && _a !== void 0 ? _a : '';
        this.startImmediatly = (_b = options.startImmediatly) !== null && _b !== void 0 ? _b : true;
        this.spinner = (_c = options.spinner) !== null && _c !== void 0 ? _c : spinner;
        this.customLogger = (_d = options.logger) !== null && _d !== void 0 ? _d : console.log;
        // < options
        this.log(this.text);
        if (this.startImmediatly)
            this.start();
    }
    log(...args) {
        if (isInteractive) {
            if (!this.logger)
                this.logger = console.draft(this.prefix, ...args);
            else
                this.logger(this.prefix, ...args);
        }
        else {
            this.customLogger(this.prefix, ...args);
        }
    }
    update(text) {
        this.text = text;
        this.log(text);
    }
    start() {
        if (!isInteractive)
            return this.log('-> ', this.text);
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
        }
        else {
            this.log('<- ', text);
        }
    }
}
exports.default = AsyncLogger;
