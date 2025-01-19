const Redis = require('ioredis');

class RedisClient {
    constructor(url) {
        this.client = new Redis(url);
    }

    async toCache(key, value, time = 20_60) {
        await this.client.set(key, JSON.stringify(value), 'EX', time);
    }

    async fromCache(key) {
        const value = await this.client.get(key);

        if (value === null) {
            return null;
        }

        return JSON.parse(value);
    }
}

module.exports = {
    RedisClient,
};
