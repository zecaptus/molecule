function timelineLogger(handler, start1, start2, end1, end2) {
  console.log('');
  console.log('_________________________');
  console.log('[DEBUG] timeline', handler);
  console.log('_________________________');
  if (end1) {
    console.log('[DEBUG] part1: ', end1 - start1, 'ms');
    console.log('[DEBUG] next: ', start2 - end1, 'ms');
    console.log('[DEBUG] part2: ', end2 - start2, 'ms');
    console.log('[DEBUG] total parts: ', end2 - start1 - (start2 - end1), 'ms');
  }
  console.log('[DEBUG] total: ', end2 - start1, 'ms');
  console.log('_________________________');
  console.log('');
}

function createMiddleware(handler, moduleHandlers) {
  let start1;
  let start2;
  let end1;
  let end2;
  let _next;

  const namedFunctions = {
    async [`${handler}_next`]() {
      end1 = Date.now();
      await _next();
      start2 = Date.now();
    },
    async [handler](ctx, next) {
      start1 = Date.now();
      _next = next;

      await moduleHandlers[handler](ctx, namedFunctions[`${handler}_next`]);
      const end2 = Date.now();

      if (end1 && !start2)
        throw new Error(
          `"${handler}" is resolved before "next()"\nTry "await next();" or "return next();"`,
        );

      timelineLogger(handler, start1, start2, end1, end2);
    },
  };

  return namedFunctions[handler];
}

module.exports = {
  createMiddleware,
};
