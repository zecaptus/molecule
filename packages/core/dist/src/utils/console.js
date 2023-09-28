"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const draftlog_1 = __importDefault(require("draftlog"));
(0, draftlog_1.default)(console);
console.clear = function () {
    process.stdout.isTTY &&
        process.stdout.write(process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H');
};
