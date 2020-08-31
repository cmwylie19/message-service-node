import redis from "redis";
import { promisify } from "util";

export const Cache = () => {
  const client = redis.createClient('6379', 'localhost');

  client.on("error", function (error) {
    console.error(`Could not connect to Message Cache ❌\n${error}`);
  });

  client.on('connect', () => console.log('Connected to Message Cache ✅'))

  return client
}

