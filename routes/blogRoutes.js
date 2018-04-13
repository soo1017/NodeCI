const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const cleanCache = require('../middlewares/cleanCache');

const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  app.get('/api/blogs', requireLogin, async (req, res) => {

    // const redis = require('redis');
    // const redisUrl = 'redis://127.0.0.1:6379';
    // const client = redis.createClient(redisUrl);
    // const util = require('util');
    // client.get = util.promisify(client.get);   // return promise
    //
    // // Do we have any cached data in redis related to this query
    // const cachedBlogs = await client.get(req.user.id);   // cachedBlogs => JSONify
    //
    // // if yes, then respond to the request right away and return
    // if (cachedBlogs) {
    //   console.log('SERVING FROM CACHE');
    //   return res.send(JSON.parse(cachedBlogs));         // need to convert JSON into javascript array for the object
    // }
    // // if no, we need to respond to request and update our cache to store the data
    // const blogs = await Blog.find({ _user: req.user.id });  // array of objects
    // console.log('SERVING FROM MONGODB');
    // res.send(blogs);
    //
    // client.set(req.user.id, JSON.stringify(blogs));         // need to convert into string(JSON) for Redis
    const blogs = await Blog.find({ _user: req.user.id}).cache({
      key: req.user.id
    });     // find creates Query instance.

    res.send(blogs);
  });

  app.post('/api/blogs', requireLogin, cleanCache, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }

    // clearHash(req.user.id);
  });
};
