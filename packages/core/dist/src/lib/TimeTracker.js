"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AsyncLogger_1 = __importDefault(require("./AsyncLogger"));
const chalk_1 = require("chalk");
class TimeTracker extends AsyncLogger_1.default {
    constructor(text, options) {
        super(text, options);
        this.createdAt = Date.now();
        this.resumeAt = 0;
        this.originalText = text;
    }
    get durationTime() {
        const idleTime = this.idleAt ? this.resumeAt - this.idleAt : 0;
        const durationTime = Date.now() - this.createdAt - idleTime;
        let color = chalk_1.red;
        switch (true) {
            case durationTime < 100:
                color = chalk_1.green;
                break;
            case durationTime < 300:
                color = chalk_1.yellow;
                break;
        }
        return (0, chalk_1.italic)(` ${color(durationTime)}ms`);
    }
    resume() {
        this.resumeAt = Date.now();
        this.text = this.originalText;
    }
    idle() {
        this.idleAt = Date.now();
        this.text = (0, chalk_1.gray)(this.text + ' - idle');
    }
    failed() {
        this.clear();
        this.log((0, chalk_1.red)('✖'), this.text, this.durationTime);
    }
    success() {
        this.clear();
        this.log((0, chalk_1.green)('✔'), this.text, this.durationTime);
    }
}
exports.default = TimeTracker;
