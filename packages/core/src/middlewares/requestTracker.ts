import { Context, Next } from 'koa';
import RequestTracker from '../lib/RequestTracker';

// TODO: improve what we catch here.
// we probably don't care about static file
async function tracker(ctx: Context, next: Next) {
  const request = new RequestTracker(ctx);
  try {
    await next();
  } catch (e) {
    request.failed();
    throw e;
  }
  request.success();
}

export default tracker;
