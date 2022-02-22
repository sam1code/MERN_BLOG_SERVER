const redis = require("redis");

const client = redis.createClient("redis://red-c8a6grfh8vl4rr7ht0ag:6379");

module.exports = client;
