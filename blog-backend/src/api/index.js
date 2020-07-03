const Router = require("koa-router");

const posts = require('./posts')
const auth = require('./auth')

const api = new Router();

api.use('/posts', posts.routes())
api.use('/auth', auth.routes())

api.get("/", (ctx) => {
  ctx.body = "홈";
});

api.get("/about/:name?", (ctx) => {
  console.log(ctx.params.name);
  ctx.body = "소개";
});

module.exports = api;