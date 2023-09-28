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
exports.initComponents = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const Component_1 = __importDefault(require("../lib/Component"));
const middlewares_1 = require("../middlewares");
/**
 * @typedef { object } options
 * @property { string } componentsPath where component are located, default: ./components
 * @property { string } swaggerFilePattern how to find swaggerfiles, default: *.swagger.yml
 */
/**
 * @param { string } path  caller path
 * @param { options } options  optionnal options
 * @return { array } array of Component
 */
function getComponents(path, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const opt = Object.assign({ componentsPath: './components', swaggerFilePattern: '*.swagger.yml' }, options);
        const componentsDir = fs_1.default
            .readdirSync((0, path_1.join)(path, opt.componentsPath), {
            withFileTypes: true,
        })
            .filter((data) => data.isDirectory());
        return Promise.all(componentsDir.map((c) => __awaiter(this, void 0, void 0, function* () {
            const component = new Component_1.default(c.name, path, opt);
            yield component.init();
            component.valid();
            return component;
        })));
    });
}
function initComponents() {
    return __awaiter(this, void 0, void 0, function* () {
        const comps = yield getComponents(this.modulePath, this.options);
        comps.forEach((comp) => {
            const operations = this.oas.addComponent(comp);
            /**
             * init routing
             */
            operations === null || operations === void 0 ? void 0 : operations.forEach(({ method, path, operationId, 'x-middlewares': middlewares }) => {
                const handlers = [...(middlewares !== null && middlewares !== void 0 ? middlewares : []), operationId].map((handler) => handler && (0, middlewares_1.createMiddleware)(handler, comp.module));
                //@ts-ignore
                this.router[method](path, ...handlers);
            });
        });
    });
}
exports.initComponents = initComponents;
