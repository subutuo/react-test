require("dotenv").config();
const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const mongoose = require('mongoose')

const api = require("./api");
const jwtMiddleware = require('./lib/jwtMiddleware')
// const { createFakeData } = require('./createFakeData')

const { PORT, MONGO_URI } = process.env;
mongoose.connect(MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }).then(() => {
  console.log('connected')
  // createFakeData();
}).catch(e => {
  console.error(e)
})


const app = new Koa();
const router = new Router();

router.use("/api", api.routes());

app.use(bodyParser());

app.use(jwtMiddleware);

app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT || 4000, () => {
  console.log("Listening 4000");
});
