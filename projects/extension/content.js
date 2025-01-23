let tracks;
let albums;
let artists;
let currentAlbumId = null;

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
        albums.parseAlbum(designStyle);
        albums.parseAlbumTracks(designStyle);

        return;
    }

    const artistMatch = url.match(/\/artist\/\d+/);
    if (artistMatch) {
        currentAlbumId = null;
        artists.parseArtist(designStyle);

        if (url.match(/\/artist\/\d+\/tracks/)) {
            updateObserverInstance('artistTracks', designStyle, artists.getTrackListObserver);
        } else if (url.match(/\/artist\/\d+$/)) {
            artists.parseArtistHome(designStyle);
        }
    }
}

function updateObserverInstance(key, designStyle, observer) {
    observersMap.get(key)?.disconnect();
    observersMap.delete(key);
    observersMap.set(key, observer(designStyle));
}

(async function bootstrap() {
    let currentUrl = null;
    let designStyle = 'old';

    await new Promise((resolve) => {
        chrome.runtime.onMessage.addListener((request, sender) => {
            designStyle = request.designStyle;
            resolve();
        });
    });

    const observer = new MutationObserver(() => {
        if (location.href !== currentUrl) {
            setTimeout(() => {
                handleUrlChange(location.href, designStyle);
            }, 1000);
            currentUrl = location.href;
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
