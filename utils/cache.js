import "dotenv/config";
import redis from "redis";
import { promisify } from "util";

export const Cache = () => {
  const client = redis.createClient(
    process.env.CACHE_PORT,
    process.env.CACHE_HOST
  );

  client.on("error", function (error) {
    console.error(`Could not connect to Message Cache ❌\n${error}`);
  });

  client.on("connect", () => console.log("Connected to Message Cache ✅"));

  const getAsync = promisify(client.get).bind(client);
  const scanAsync = promisify(client.keys).bind(client);
  const setAsync = promisify(client.set).bind(client);
  const delAsync = promisify(client.del).bind(client);
  return {
    client,
    getAsync,
    setAsync,
    scanAsync,
    delAsync
  };
};
