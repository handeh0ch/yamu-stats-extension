export async function getTrack(artist, title) {
    return fetch(`https://yamu-stats-extension-api.vercel.app/api/track?artist=${artist}&name=${title}&service=lastfm`);
}

export async function getAlbum(artist, title) {
    return fetch(`https://yamu-stats-extension-api.vercel.app/api/album?artist=${artist}&name=${title}&service=lastfm`);
}
