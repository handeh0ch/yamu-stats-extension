const { formatter, axiosInstance } = require('../helpers');

class LastFMSource {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async getArtist(name) {
        try {
            const response = await axiosInstance.get(
                `?method=artist.getinfo&artist=${name}&api_key=${this.apiKey}&format=json`
            );

            if (response.status !== 200) {
                throw new Error('Failed to fetch artist information');
            }

            return {
                listeners: formatter.format(parseInt(response.data.artist.stats.listeners)),
                playcount: formatter.format(parseInt(response.data.artist.stats.playcount)),
            };
        } catch (error) {
            throw new Error(error.message || 'Failed to fetch artist information');
        }
    }

    async getAlbum(artist, name) {
        try {
            const response = await axiosInstance.get(
                `/?method=album.getInfo&api_key=${this.apiKey}&artist=${artist}&album=${name}&format=json`
            );

            if (response.status !== 200) {
                throw new Error('Failed to fetch album information');
            }

            return {
                listeners: formatter.format(parseInt(response.data.album.listeners)),
                playcount: formatter.format(parseInt(response.data.album.playcount)),
            };
        } catch (error) {
            throw new Error(error.message || 'Failed to fetch album information');
        }
    }

    async getTrack(artist, name) {
        try {
            const response = await axiosInstance.get(
                `/?method=track.getInfo&api_key=${this.apiKey}&artist=${artist}&track=${name}&format=json`
            );

            if (response.status !== 200) {
                throw new Error('Failed to fetch track information');
            }

            return {
                listeners: formatter.format(parseInt(response.data.track.listeners)),
                playcount: formatter.format(parseInt(response.data.track.playcount)),
            };
        } catch (error) {
            throw new Error(error.message || 'Failed to fetch track information');
        }
    }
}

module.exports = {
    LastFMSource,
};
