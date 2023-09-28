import { Middleware, Context, Next } from 'koa';
import Component from '../lib/Component';

function createMiddleware(
  handler: string,
  moduleHandlers: Component['module'],
): Middleware {
  let nextStarted = false;
  let nextEnded = false;

  let _next: Next;
  let _ctx: Context;

  const namedFunctions = {
    async [`${handler}_next`]() {
      nextStarted = true;
      _ctx.app.emit('mw:end', { handler, status: 'idle' });
      await _next();
      nextEnded = true;
      _ctx.app.emit('mw:start', { handler, status: 'resume' });
    },
    async [handler](ctx: Context, next: Next) {
      _ctx = ctx;
      _next = next;

      // emit start
      ctx.app.emit('mw:start', { handler, status: 'create' });

      try {
        await moduleHandlers[handler](ctx, namedFunctions[`${handler}_next`]);
        if (nextStarted && !nextEnded) {
          throw new Error(
            `"${handler}" is resolved before "next()"\nTry "await next();" or "return next();"`,
          );
        }
      } catch (e) {
        ctx.app.emit('mw:end', { handler, status: 'error' });
        throw e;
      }
      // emit end
      ctx.app.emit('mw:end', { handler, status: 'done' });
    },
  };

  return namedFunctions[handler];
}

export { createMiddleware };
