"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const package_json_1 = require("../../package.json");
const AsyncLogger_1 = __importDefault(require("../lib/AsyncLogger"));
const chalk_1 = require("chalk");
const gradient_string_1 = __importDefault(require("gradient-string"));
const port_1 = require("./port");
const isInteractive = process.stdout.isTTY;
function moleculeGradient(text) {
    return (0, gradient_string_1.default)('#61affe', 'white')(text);
}
function sign() {
    console.clear();
    console.log('');
    console.log((0, gradient_string_1.default)('#61affe', 'white').multiline([
        '              __             __   ',
        '  __ _  ___  / /__ ______ __/ /__ ',
        " /  ' \\/ _ \\/ / -_) __/ // / / -_)",
        '/_/_/_/\\___/_/\\__/\\__/\\_,_/_/\\__/ ',
        `_________________________________v${package_json_1.version}`,
    ].join('\n')));
    console.log('');
    const info = new AsyncLogger_1.default(moleculeGradient('Booting'));
    console.log((0, chalk_1.italic)(moleculeGradient('\nℹ type `rs` to reload at anytime')));
    console.log(moleculeGradient('________________________________________'));
    console.log('');
    return info;
}
function boot(port) {
    return __awaiter(this, void 0, void 0, function* () {
        let info = sign();
        info.update(`checking port: ${port}`);
        info.clear();
        const _port = yield (0, port_1.choosePort)(port);
        if (isInteractive && port !== _port) {
            info = sign();
        }
        if (!_port) {
            info.update((0, chalk_1.red)("Can't start molecule"));
            process.exit(1);
        }
        return { info, port: _port };
    });
}
exports.default = boot;
