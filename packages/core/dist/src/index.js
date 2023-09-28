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
exports.createApp = exports.MoleculeApp = void 0;
require("./utils/console");
const path_1 = require("path");
const koa_1 = __importDefault(require("koa"));
const koa_router_1 = __importDefault(require("koa-router"));
const OAS_1 = __importDefault(require("./lib/OAS"));
//@ts-ignore
const swagger_ui_1 = __importDefault(require("@molecule/swagger-ui"));
const requestTracker_1 = __importDefault(require("./middlewares/requestTracker"));
const boot_1 = __importDefault(require("./utils/boot"));
const init_1 = require("./utils/init");
const openBrowser_1 = __importDefault(require("react-dev-utils/openBrowser"));
class MoleculeApp {
    constructor(modulePath, options) {
        this.options = options;
        this.modulePath = modulePath;
        this.oas = new OAS_1.default();
        this.started = false;
        this.router = new koa_router_1.default();
        this.port = process.env.PORT ? Number(process.env.PORT) : 3000;
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const { info, port } = yield (0, boot_1.default)(this.port);
            this.info = info;
            this.port = port;
            info.update('init: OpenApi Object');
            yield this.oas.init(this.modulePath);
            info.update('init: components');
            yield init_1.initComponents.apply(this);
            info.update('validate: OpenApi Object');
            yield this.oas.validate();
            this.start();
        });
    }
    start() {
        var _a;
        const server = new koa_1.default();
        server.use(requestTracker_1.default);
        server.use((0, swagger_ui_1.default)('/docs', {
            spec: this.oas.spec,
        }));
        server.use(this.router.routes());
        this.started = true;
        server.listen(this.port);
        (_a = this.info) === null || _a === void 0 ? void 0 : _a.clear(`Listen: http://localhost:${this.port}`);
        (0, openBrowser_1.default)(`http://localhost:${this.port}/docs`);
    }
}
exports.MoleculeApp = MoleculeApp;
/**
 * options
 * ========
 *
 * componentsPath: './components',
 * swaggerFilePattern: '*.swagger.yml',
 */
function createApp(options = {
    componentsPath: './components',
    swaggerFilePattern: '*.swagger.yml',
}) {
    var _a, _b;
    const modulePath = (0, path_1.dirname)((_b = (_a = require.main) === null || _a === void 0 ? void 0 : _a.filename) !== null && _b !== void 0 ? _b : '');
    return new MoleculeApp(modulePath, options);
}
exports.createApp = createApp;
