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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMiddleware = void 0;
function createMiddleware(handler, moduleHandlers) {
    let nextStarted = false;
    let nextEnded = false;
    let _next;
    let _ctx;
    const namedFunctions = {
        [`${handler}_next`]() {
            return __awaiter(this, void 0, void 0, function* () {
                nextStarted = true;
                _ctx.app.emit('mw:end', { handler, status: 'idle' });
                yield _next();
                nextEnded = true;
                _ctx.app.emit('mw:start', { handler, status: 'resume' });
            });
        },
        [handler](ctx, next) {
            return __awaiter(this, void 0, void 0, function* () {
                _ctx = ctx;
                _next = next;
                // emit start
                ctx.app.emit('mw:start', { handler, status: 'create' });
                try {
                    yield moduleHandlers[handler](ctx, namedFunctions[`${handler}_next`]);
                    if (nextStarted && !nextEnded) {
                        throw new Error(`"${handler}" is resolved before "next()"\nTry "await next();" or "return next();"`);
                    }
                }
                catch (e) {
                    ctx.app.emit('mw:end', { handler, status: 'error' });
                    throw e;
                }
                // emit end
                ctx.app.emit('mw:end', { handler, status: 'done' });
            });
        },
    };
    return namedFunctions[handler];
}
exports.createMiddleware = createMiddleware;
