const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');

// const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(keys.redisUrl);
// const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);
// client.get = util.promisify(client.get);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}) {   // in case there is no argument of object
  this.useCache = true;  // this referring to Query & useCache will be set 'true' when Query instnace get attached with .cache()
  this.hashKey = JSON.stringify(options.key || '');
  return this; // return this makes this function as chainable
}

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }
  // this: refer to Query
  console.log('IM ABOUT TO RUN A QUERY');

  // get Query
  console.log(this.getQuery());
  // get name of collection
  console.log(this.mongooseCollection.name);

  // combine two objects into one without modifyinh original ones
  const key = JSON.stringify(Object.assign({}, this.getQuery(), {
    collection: this.mongooseCollection.name
  }));

  // see if we have a value for 'key' in redis
  const cacheValue = await client.hget(this.hashKey, key);
  // const cacheValue = await client.get(key);

  // if we do, return that
  if (cacheValue) {
    console.log(this);    // this refrerring to Query that has 'model' property
    // console.log(cacheValue);
    //return new this.model(JSON.parse(cacheValue));  // for mongoose model instance || return single object or array
    const doc = JSON.parse(cacheValue);

    // Array.isArray(doc) ? its an array | its an object
    return Array.isArray(doc) ? doc.map(d => new this.model(d)) : new this.model(doc)
    // same as ...
    // new Blog({
        // title: 'Hi',
        // content: 'There'
    // })
    // return JSON.parse(cacheValue);
  }
  // Otherwise, issue the query and store the result in redis

  console.log(key);
  // run original exec function
  // return exec.apply(this, arguments);  // remove return because want to work with results
  const result = await exec.apply(this, arguments);   // result here is the actual document instance
  console.log(result);   // upto this point, error will happen because of no valid return value for

  client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);            // for redis
  // client.set(key, JSON.stringify(result), 'EX', 10);            // for redis

  return result;
}

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  }
};
