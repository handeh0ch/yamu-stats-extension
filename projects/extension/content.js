let tracks;
let albums;
let currentAlbumId = null;

(async function () {
    tracks = await import(chrome.runtime.getURL('parser/tracks.js'));
    albums = await import(chrome.runtime.getURL('parser/albums.js'));
})();

const observersMap = new Map();

function handleUrlChange(url, designStyle) {
    if (url.match(/\/users\/.*\/tracks/)) {
        updateObserverInstance('tracks', designStyle, tracks.parse);
    }

    const albumMatch = url.match(/\/album\/\d+/);
    if (albumMatch) {
        const albumId = albumMatch[0].split('/')[2];
        if (currentAlbumId === albumId) {
            return;
        }

        currentAlbumId = albumId;
        albums.parseAlbum('old');
        albums.parseAlbumTracks('old');
    }

    if (url.match(/\/artist\/\d+/)) {
        console.log('Parsing artist for: ', url);

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
