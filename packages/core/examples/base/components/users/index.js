function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

module.exports = {
  getUsers: async ctx => {
    console.log('get user');
    await new Promise(resolve => setTimeout(resolve, getRandomInt(1500)));
    ctx.body = [
      {
        id: 1,
        name: 'toto',
      },
    ];
  },
  middleware1: async (ctx, next) => {
    await new Promise(resolve => setTimeout(resolve, getRandomInt(1500)));
    await next();
    await new Promise(resolve => setTimeout(resolve, getRandomInt(1500)));
  },
  middleware2: async (ctx, next) => {
    await new Promise(resolve => setTimeout(resolve, getRandomInt(1500)));
    await next();
    await new Promise(resolve => setTimeout(resolve, getRandomInt(1500)));
  },
};
