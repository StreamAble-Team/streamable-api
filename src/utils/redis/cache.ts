import redis from "./client";

const get = async <T>(key: string) => {
  const value = await redis.get(key);
  if (value === null) return null as any;

  return JSON.parse(value);
};

const set = async <T>(key: string, fetcher: () => T, expires: number) => {
  const value = await fetcher();

  const setData = await redis.set(key, JSON.stringify(value), "EX", expires);

  if (setData === "OK") return value;
  return null as any;
};

const fetch = async <T>(key: string, fetcher: () => T, expires: number) => {
  const existing = await get<T>(key);
  if (existing !== null) return existing;

  return set(key, fetcher, expires);
};

const del = async (key: string) => {
  const deleted = await redis.del(key);
  return deleted;
};

export { get, set, del, fetch };
