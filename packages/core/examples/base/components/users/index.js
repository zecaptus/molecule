module.exports = {
  getUsers: ctx => {
    console.log('get user');
    ctx.body = [
      {
        id: 1,
        name: 'toto',
      },
    ];
  },
  middleware1: async (ctx, next) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    await next();
  },
  middleware2: (ctx, next) => {
    return next();
  },
};
