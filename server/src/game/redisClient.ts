import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL
});
redis.connect();

export default redis;
