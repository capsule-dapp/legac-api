import { createClient } from 'redis'
import { config } from './config'

export const client = createClient({ url: config.redisUri });
export async function connect() {
    await client.connect();
}

export class Cache {
    async connect() {
        await client.connect()
    }
    async get(key: string) {
        const data = await client.get(key);
        return JSON.parse(data as any);
    }

    async set(key: string, value: string, ttl: number) {
        await client.set(key, JSON.stringify(value));
        await client.expire(key, ttl);
    }

    async delete(key: string) {
        await client.del(key)
    }

    async getOrSet(key: string, value: any, ttl: number) {
        if (value == undefined) return;
        const exists = await client.exists(key);
        if (!exists) {
            await client.set(key, JSON.stringify(value));
            await client.expire(key, ttl);
            return value
        } else {
            const data = await client.get(key);
            return JSON.parse(data as any);
        }
    }


}