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
const RequestTracker_1 = __importDefault(require("../lib/RequestTracker"));
// TODO: improve what we catch here.
// we probably don't care about static file
function tracker(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const request = new RequestTracker_1.default(ctx);
        try {
            yield next();
        }
        catch (e) {
            request.failed();
            throw e;
        }
        request.success();
    });
}
exports.default = tracker;
