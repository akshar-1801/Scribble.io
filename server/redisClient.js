const { createClient } = require("redis");

const redis = createClient({
  url: 'redis://default:fvYAd9EyNm3IIV5FbS9rpHS07yhVWp9n@redis-12488.crce179.ap-south-1-1.ec2.redns.redis-cloud.com:12488',
});

redis.on("error", (err) => console.error("Redis Error:", err));
console.log("Redis Client Created");

(async () => {
  await redis.connect();
})();

module.exports = redis;
