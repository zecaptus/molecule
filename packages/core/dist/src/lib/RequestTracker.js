"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TimeTracker_1 = __importDefault(require("./TimeTracker"));
var Status;
(function (Status) {
    Status["CREATE"] = "create";
    Status["ERROR"] = "error";
    Status["DONE"] = "done";
    Status["IDLE"] = "idle";
})(Status || (Status = {}));
class RequestTracker extends TimeTracker_1.default {
    constructor(ctx, options) {
        super(`${ctx.method} ${ctx.url}`, options);
        this.onStart = ({ handler, status }) => {
            if (!this.middlewares[handler] && status === Status.CREATE) {
                this.middlewares[handler] = new TimeTracker_1.default(handler, { prefix: '  ' });
            }
            else {
                this.middlewares[handler].resume();
            }
        };
        this.onEnd = ({ handler, status }) => {
            switch (status) {
                case Status.ERROR:
                    this.middlewares[handler].failed();
                    break;
                case Status.DONE:
                    this.middlewares[handler].success();
                    break;
                case Status.IDLE:
                    this.middlewares[handler].idle();
                    break;
            }
        };
        this.ctx = ctx;
        ctx.app.on('mw:start', this.onStart);
        ctx.app.on('mw:end', this.onEnd);
        this.middlewares = {};
    }
    failed() {
        super.failed();
        this.ctx.app.off('mw:start', this.onStart);
        this.ctx.app.off('mw:end', this.onEnd);
    }
    success() {
        super.success();
        this.ctx.app.off('mw:start', this.onStart);
        this.ctx.app.off('mw:end', this.onEnd);
    }
}
exports.default = RequestTracker;
