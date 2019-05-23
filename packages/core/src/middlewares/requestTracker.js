const RequestTracker = require('../lib/RequestTracker');

// TODO: improve what we catch here.
// we probably don't care about static file
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
