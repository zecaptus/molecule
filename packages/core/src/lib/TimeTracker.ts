import AsyncLogger, { AsyncLoggerOptions } from './AsyncLogger';
import { green, gray, yellow, red, italic } from 'chalk';

class TimeTracker extends AsyncLogger {
  createdAt: number;
  idleAt: number | undefined;
  resumeAt: number;
  originalText: string;

  constructor(text: string, options?: AsyncLoggerOptions) {
    super(text, options);

    this.createdAt = Date.now();
    this.resumeAt = 0;
    this.originalText = text;
  }

  get durationTime() {
    const idleTime = this.idleAt ? this.resumeAt - this.idleAt : 0;
    const durationTime = Date.now() - this.createdAt - idleTime;

    let color = red;
    switch (true) {
      case durationTime < 100:
        color = green;
        break;
      case durationTime < 300:
        color = yellow;
        break;
    }

    return italic(` ${color(durationTime)}ms`);
  }

  resume() {
    this.resumeAt = Date.now();
    this.text = this.originalText;
  }

  idle() {
    this.idleAt = Date.now();
    this.text = gray(this.text + ' - idle');
  }

  failed() {
    this.clear();
    this.log(red('✖'), this.text, this.durationTime);
  }

  success() {
    this.clear();
    this.log(green('✔'), this.text, this.durationTime);
  }
}

export default TimeTracker;
