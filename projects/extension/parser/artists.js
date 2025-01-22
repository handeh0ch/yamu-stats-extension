let api;
let elementCreator;

(async function () {
    api = await import(chrome.runtime.getURL('api.js'));
    elementCreator = await import(chrome.runtime.getURL('element-creator.js'));
})();

const parserMap = new Map();
const trackSet = new Set();

parserMap.set('old', {
    parseArtist: parseArtistOld,
    getTrackListObserver: observeArtistTrackListOld,
});

export function parseArtist(designStyle) {
    parserMap.get(designStyle).parseArtist();
}

export function getTrackListObserver(designStyle) {
    trackSet.clear();
    return parserMap.get(designStyle).getTrackListObserver();
}

function parseArtistOld() {
    const artist = document.querySelector('.page-artist__title')?.textContent.trim();

    if (!artist) {
        return;
    }

    api.getArtist(artist)
        .then((response) => response.json())
        .then((data) => {
            if (data.message) {
                data.playcount = 'No data';
            }

            document
                .querySelector('.d-generic-page-head__main-top')
                .insertAdjacentElement('beforeend', elementCreator.createArtistPlayCountElementOld(data.playcount));
        });
}

function observeArtistTrackListOld() {
    let trackList = null;

    while (trackList === null) {
        trackList = document.querySelector('.lightlist__cont');
    }

    const artist = document.querySelector('.page-artist__title')?.textContent.trim();

    if (!artist) {
        return;
    }

    parseArtistTracksOld(
        Array.from(document.querySelectorAll('.d-track')).map((node) => {
            const title = node.querySelector('.d-track__title')?.textContent.trim();
            trackSet.add(`${artist} - ${title}`);

            return { artist, title, node };
        })
    );

    const observer = new MutationObserver((mutations) => {
        const newTracks = [];

        mutations.forEach((mutation) => {
            Array.from(mutation.addedNodes).forEach((node) => {
                const title = node.querySelector('.d-track__title')?.textContent.trim();

                if (node.nodeType === Node.ELEMENT_NODE && !trackSet.has(`${artist} - ${title}`)) {
                    trackSet.add(`${artist} - ${title}`);
                    newTracks.push({ artist, title, node });
                }
            });
        });

        if (newTracks.length > 0) {
            parseArtistTracksOld(newTracks);
        }
    });

    observer.observe(trackList, {
        childList: true,
    });

    return observer;
}

function parseArtistTracksOld(tracks) {
    Promise.all(
        tracks.map(({ artist, title, node }) => {
            if (!artist || !title) {
                return Promise.resolve();
            }

            return api
                .getTrack(artist, title)
                .then((response) => response.json())
                .then((data) => {
                    if (data.message) {
                        data.playcount = 'No data';
                    }

                    trackSet.add(`${artist} - ${title}`);

                    node.insertBefore(
                        elementCreator.createTrackPlayCountElementOld(data.playcount),
                        node.querySelector('.d-track__overflowable-column')
                    );
                });
        })
    );
}
