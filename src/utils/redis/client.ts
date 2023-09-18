import Redis from "ioredis";
import { log } from "../logger";

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
});

redis.on("connect", () => {
  log.info("⚡ Redis connected");
});

redis.on("error", (err) => {
  log.error("Redis error: ", err);
});

export default redis;
