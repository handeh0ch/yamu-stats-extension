const axios = require('axios');

const formatter = new Intl.NumberFormat('de-DE');
const axiosInstance = axios.create({ baseURL: 'https://ws.audioscrobbler.com/2.0/' });

module.exports = {
    formatter,
    axiosInstance,
};
