const { green, gray, yellow, red, italic } = require("chalk");

const spinner = {
  interval: 80,
  frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
};

class Tracker {
  constructor(text, prefix = "") {
    this.text = text;
    this.originalText = text;
    this.prefix = prefix;
    this.log = console.draft(prefix, spinner.frames[0], this.text);
    this.createdAt = Date.now();

    let cpt = 0;
    this.timer = setInterval(() => {
      cpt++;
      this.log(prefix, spinner.frames[cpt % spinner.frames.length], this.text);
    }, spinner.interval);
  }

  get durationTime() {
    const idleTime = this.idleAt ? this.resumeAt - this.idleAt : 0;
    const durationTime = Date.now() - this.createdAt - idleTime;

    let color = red;
    switch (true) {
      case durationTime < 100:
        color = green;
        break;
      case durationTime < 300:
        color = yellow;
        break;
    }

    return italic(` ${color(durationTime)}ms`);
  }

  resume() {
    this.resumeAt = Date.now();
    this.text = this.originalText;
  }

  idle() {
    this.idleAt = Date.now();
    this.text = gray(this.text + " - idle");
  }

  failed() {
    this.log(this.prefix, red("✖"), this.text, this.durationTime);
    clearInterval(this.timer);
  }

  success() {
    this.log(this.prefix, green("✔"), this.text, this.durationTime);
    clearInterval(this.timer);
  }
}

class RequestTracker extends Tracker {
  constructor(ctx) {
    super(`${ctx.method} ${ctx.url}`);

    this.ctx = ctx;
    ctx.app.on("mw:start", this.onStart);
    ctx.app.on("mw:end", this.onEnd);
    this.middlewares = {};
  }

  onStart = ({ handler, status }) => {
    if (!this.middlewares[handler] && status === "create") {
      this.middlewares[handler] = new Tracker(handler, "  ");
    } else {
      this.middlewares[handler].resume();
    }
  };

  onEnd = ({ handler, status }) => {
    switch (status) {
      case "error":
        this.middlewares[handler].failed();
        break;
      case "done":
        this.middlewares[handler].success();
        break;
      case "idle":
        this.middlewares[handler].idle();
        break;
    }
  };

  failed() {
    super.failed();
    this.ctx.app.off("mw:start", this.onStart);
    this.ctx.app.off("mw:end", this.onEnd);
  }

  success() {
    super.success();
    this.ctx.app.off("mw:start", this.onStart);
    this.ctx.app.off("mw:end", this.onEnd);
  }
}

async function tracker(ctx, next) {
  const request = new RequestTracker(ctx);
  try {
    await next();
  } catch (e) {
    request.failed();
    throw e;
  }
  request.success();
}

module.exports = tracker;
