import { Context } from 'koa';
import TimeTracker from './TimeTracker';
import { AsyncLoggerOptions } from './AsyncLogger';

enum Status {
  CREATE = 'create',
  ERROR = 'error',
  DONE = 'done',
  IDLE = 'idle',
}

type EventHandlerParameters = {
  handler: string;
  status: Status;
};

class RequestTracker extends TimeTracker {
  ctx: Context;
  middlewares: {
    [handler: string]: TimeTracker;
  };
  constructor(ctx: Context, options?: AsyncLoggerOptions) {
    super(`${ctx.method} ${ctx.url}`, options);

    this.ctx = ctx;
    ctx.app.on('mw:start', this.onStart);
    ctx.app.on('mw:end', this.onEnd);
    this.middlewares = {};
  }

  onStart = ({ handler, status }: EventHandlerParameters) => {
    if (!this.middlewares[handler] && status === Status.CREATE) {
      this.middlewares[handler] = new TimeTracker(handler, { prefix: '  ' });
    } else {
      this.middlewares[handler].resume();
    }
  };

  onEnd = ({ handler, status }: EventHandlerParameters) => {
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

export default RequestTracker;
