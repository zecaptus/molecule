const TimeTracker = require('./TimeTracker');

class RequestTracker extends TimeTracker {
  constructor(ctx, options) {
    super(`${ctx.method} ${ctx.url}`, options);

    this.ctx = ctx;
    ctx.app.on('mw:start', this.onStart);
    ctx.app.on('mw:end', this.onEnd);
    this.middlewares = {};
  }

  onStart = ({ handler, status }) => {
    if (!this.middlewares[handler] && status === 'create') {
      this.middlewares[handler] = new TimeTracker(handler, { prefix: '  ' });
    } else {
      this.middlewares[handler].resume();
    }
  };

  onEnd = ({ handler, status }) => {
    switch (status) {
      case 'error':
        this.middlewares[handler].failed();
        break;
      case 'done':
        this.middlewares[handler].success();
        break;
      case 'idle':
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

module.exports = RequestTracker;
