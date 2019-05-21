function createMiddleware(handler, moduleHandlers) {
  let nextStarted = false;
  let nextEnded = false;

  let _next;
  let _ctx;

  const namedFunctions = {
    async [`${handler}_next`]() {
      nextStarted = true;
      _ctx.app.emit('mw:end', { handler, status: 'idle' });
      await _next();
      nextEnded = true;
      _ctx.app.emit('mw:start', { handler, status: 'resume' });
    },
    async [handler](ctx, next) {
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

module.exports = {
  createMiddleware,
};
