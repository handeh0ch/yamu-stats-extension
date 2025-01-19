require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PORT, LASTFM_API, REDIS_URL } = require('./constants');
const { statsSource } = require('./source/source');
const { RedisClient } = require('./redis');

const app = express();
const apiRouter = express.Router();
const redisClient = new RedisClient(REDIS_URL);

if (!LASTFM_API || !REDIS_URL) {
    console.error('Error: Environment variables not set.');
    process.exit(1);
}

app.use(express.json());
app.use(cors({ origin: 'https://music.yandex.ru' }));
app.get('/', (req, res) => res.send('Express on Vercel'));

apiRouter.get('/artist/:name', async (req, res) => {
    const { name } = req.params;
    const { service: serviceName } = req.query;
    const service = statsSource.get(serviceName);
    const cacheKey = `${name} - ${service}`;

    if (!service) {
        res.status(400).json({
            message: 'No statistics service name provided',
        });
    }

    try {
        let data = await redisClient.fromCache(cacheKey);

        if (data === null) {
            data = await service.getArtist(name);
            await redisClient.toCache(cacheKey, data);
        }

        res.status(200).json(data);
    } catch (e) {
        res.status(500).json({
            message: e.message || 'An error occurred while fetching artist information',
        });
    }
});

apiRouter.get('/album', async (req, res) => {
    const { artist, name, service: serviceName } = req.query;
    const service = statsSource.get(serviceName);
    const cacheKey = `${artist} - ${name} - ${service}`;

    if (!service) {
        res.status(400).json({
            message: 'No statistics service name provided',
        });
    }

    try {
        let data = await redisClient.fromCache(cacheKey);

        if (data === null) {
            data = await service.getAlbum(artist, name);
            await redisClient.toCache(cacheKey, data);
        }

        res.status(200).json(data);
    } catch (e) {
        res.status(500).json({
            message: e.message || 'An error occurred while fetching album information',
        });
    }
});

apiRouter.get('/track', async (req, res) => {
    const { artist, name, service: serviceName } = req.query;
    const service = statsSource.get(serviceName);
    const cacheKey = `${artist} - ${name} - ${service}`;

    if (!service) {
        res.status(400).json({
            message: 'No statistics service name provided',
        });
    }

    try {
        let data = await redisClient.fromCache(cacheKey);

        if (data === null) {
            data = await service.getTrack(artist, name);
            await redisClient.toCache(cacheKey, data);
        }

        res.status(200).json(data);
    } catch (e) {
        res.status(500).json({
            message: e.message || 'An error occurred while fetching track information',
        });
    }
});

app.use('/api', apiRouter);

app.listen(PORT, () => {
    console.log(`Server is up on port: ${PORT}`);
});

module.exports = app;
