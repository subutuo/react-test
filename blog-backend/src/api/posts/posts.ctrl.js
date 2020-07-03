const Post = require("../../models/post");
const mongoose = require("mongoose");
const Joi = require("joi");

const { ObjectId } = mongoose.Types;

exports.getPostById = async (ctx, next) => {
  const { id } = ctx.params;
  if (!ObjectId.isValid(id)) {
    ctx.status = 400;
    console.log("400");
    return;
  }

  try {
    const post = await Post.findById(id);

    if (!post) {
      ctx.status = 404;
      return;
    }
    ctx.state.post = post;
    return next();
  } catch (e) {
    ctx.throw(500, e);
  }

  return next();
};

exports.checkOwnPost = (ctx, next) => {
  const { user, post } = ctx.state;
  if (post.user._id.toString() !== user._id) {
    ctx.status = 403;
    return;
  }
  return next();
};

exports.write = async (ctx) => {
  const schema = Joi.object().keys({
    title: Joi.string().required(),
    body: Joi.string().required(),
    tags: Joi.array().items(Joi.string()).required(),
  });

  const result = Joi.validate(ctx.request.body, schema);

  if (result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const { title, body, tags } = ctx.request.body;
  const post = new Post({
    title,
    body,
    tags,
    user: ctx.state.user,
  });

  try {
    await post.save();
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};

exports.list = async (ctx) => {
  const page = parseInt(ctx.query.page || "1", 10);
  if (page < 1 || Number.isNaN(page)) {
    ctx.status = 400;
    return;
  }

  const { tag, username } = ctx.query;

  const query = {
    ...(username ? { "user.username": username } : {}),
    ...(tag ? { tags: tag } : {}),
  };

  try {
    const posts = await Post.find(query)
      .sort({ _id: -1 })
      .skip((page - 1) * 10)
      .limit(10)
      .lean()
      .exec();
    const postCount = await Post.countDocuments(query).exec();
    ctx.set("Last-Page", Math.ceil(postCount / 10));
    ctx.body = posts.map((post) => ({
      ...post,
      body: post.body.length < 5 ? post.body : `${post.body.slice(0, 5)}...}`,
    }));
  } catch (e) {
    ctx.throw(500, e);
  }
};

exports.read = async (ctx) => {
  ctx.body = ctx.state.post;
};
exports.remove = async (ctx) => {
  try {
    const { id } = ctx.params;
    await Post.findByIdAndRemove(id).exec();
    ctx.status = 204; // No Content
  } catch (e) {
    ctx.throw(500, e);
  }
};
exports.update = async (ctx) => {
  try {
    const schema = Joi.object().keys({
      title: Joi.string(),
      body: Joi.string(),
      tags: Joi.array().items(Joi.string()),
    });

    const result = Joi.validate(ctx.request.body, schema);

    if (result.error) {
      ctx.status = 400;
      ctx.body = result.error;
      return;
    }

    const { id } = ctx.params;
    const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
      new: true,
    }).exec();

    if (!post) {
      ctx.status = 404;
      return;
    }

    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};
