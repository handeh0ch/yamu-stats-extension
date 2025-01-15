require('dotenv').config();
const express = require('express');
const { PORT, LASTFM_API } = require('./constants');
const { statsSource } = require('./source/source');

const app = express();
app.use(express.json());
const apiRouter = express.Router();

if (!LASTFM_API) {
    console.error('Error: LASTFM_API key is not set in the environment variables.');
    process.exit(1);
}

app.get('/', (req, res) => res.send('Express on Vercel'));

apiRouter.get('/artist/:name', async (req, res) => {
    const { name } = req.params;
    const { serviceName } = req.query;
    const service = statsSource.get(serviceName);

    if (!service) {
        res.status(400).json({
            message: 'No statistics service name provided',
        });
    }

    try {
        const data = await service.getArtist(name);
        res.status(200).json(data);
    } catch (e) {
        res.status(500).json({
            message: e.message || 'An error occurred while fetching artist information',
        });
    }
});

apiRouter.get('/album', async (req, res) => {
    const { artist, name, serviceName } = req.query;
    const service = statsSource.get(serviceName);

    if (!service) {
        res.status(400).json({
            message: 'No statistics service name provided',
        });
    }

    try {
        const data = await service.getAlbum(artist, name);
        res.status(200).json(data);
    } catch (e) {
        res.status(500).json({
            message: e.message || 'An error occurred while fetching album information',
        });
    }
});

apiRouter.get('/track', async (req, res) => {
    const { artist, name, serviceName } = req.query;
    const service = statsSource.get(serviceName);

    if (!service) {
        res.status(400).json({
            message: 'No statistics service name provided',
        });
    }

    try {
        const data = await service.getTrack(artist, name);
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
