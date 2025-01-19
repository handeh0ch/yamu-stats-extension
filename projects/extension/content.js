let tracks;
let albums;
let artists;
let currentAlbumId = null,
    currentArtistId = null;

(async function () {
    tracks = await import(chrome.runtime.getURL('parser/tracks.js'));
    albums = await import(chrome.runtime.getURL('parser/albums.js'));
    artists = await import(chrome.runtime.getURL('parser/artists.js'));
})();

const observersMap = new Map();

function handleUrlChange(url, designStyle) {
    if (url.match(/\/users\/.*\/tracks/)) {
        currentAlbumId = null;
        currentArtistId = null;
        updateObserverInstance('tracks', designStyle, tracks.parse);

        return;
    }

    const albumMatch = url.match(/\/album\/\d+/);
    if (albumMatch) {
        currentArtistId = null;

        const albumId = albumMatch[0].split('/')[2];
        if (currentAlbumId === albumId) {
            return;
        }

        currentAlbumId = albumId;
        albums.parseAlbum('old');
        albums.parseAlbumTracks('old');

        return;
    }

    const artistMatch = url.match(/\/artist\/\d+/);
    if (artistMatch) {
        currentAlbumId = null;

        const artistId = artistMatch[0].split('/')[2];
        if (currentArtistId === artistId) {
            return;
        }

        currentArtistId = artistId;
        artists.parseArtist('old');

        if (url.match(/\/artist\/\d+\/tracks/)) {
        }
    }
}

function updateObserverInstance(key, designStyle, observer) {
    observersMap.get(key)?.disconnect();
    observersMap.delete(key);
    observersMap.set(key, observer(designStyle));
}

(function bootstrap() {
    let currentUrl = null;

    const observer = new MutationObserver(() => {
        if (location.href !== currentUrl) {
            setTimeout(() => {
                handleUrlChange(location.href, 'old');
            }, 1000);
            currentUrl = location.href;
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
