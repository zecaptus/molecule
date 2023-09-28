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
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const js_yaml_1 = __importDefault(require("js-yaml"));
const micromatch_1 = __importDefault(require("micromatch"));
const lodash_1 = require("lodash");
class Component {
    constructor(name, path, options) {
        this.name = name;
        this.path = (0, path_1.join)(path, options.componentsPath, name);
        this.module = null;
        this.spec = {};
        this.isSwaggerFile = micromatch_1.default.matcher(options.swaggerFilePattern);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all([this.require(), this.extractSpec()]);
        });
    }
    require() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                this.module = require(this.path);
                resolve();
            });
        });
    }
    extractSpec() {
        return __awaiter(this, void 0, void 0, function* () {
            const swaggerFiles = fs_1.default
                .readdirSync(this.path)
                .filter((file) => this.isSwaggerFile(file));
            const docs = yield Promise.all(swaggerFiles.map((file) => this.requireYml(file)));
            (0, lodash_1.merge)(this.spec, ...docs);
        });
    }
    requireYml(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                const doc = js_yaml_1.default.load(fs_1.default.readFileSync((0, path_1.join)(this.path, filename), 'utf8'));
                resolve(doc);
            });
        });
    }
    // check if controllers exists
    valid() {
        const { paths } = this.spec;
        if (!paths)
            return false;
        return Object.keys(paths).some((path) => {
            var _a;
            return Object.keys((_a = paths[path]) !== null && _a !== void 0 ? _a : {}).some((method) => {
                var _a;
                const controllers = (_a = paths[path][method]) === null || _a === void 0 ? void 0 : _a['x-controller'];
                if (!controllers)
                    return false;
                return []
                    .concat(controllers)
                    .some((controller) => Object.hasOwnProperty.call(this.module, controller));
            });
        });
    }
}
exports.default = Component;
