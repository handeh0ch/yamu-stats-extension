const { LASTFM_API } = require('../constants');
const { LastFMSource } = require('./lastfm');

const statsSource = new Map();
statsSource.set('lastfm', new LastFMSource(LASTFM_API));

module.exports = {
    statsSource,
};
