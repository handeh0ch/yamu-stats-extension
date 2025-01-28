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
    parseArtistHome: parseArtistHomeOld,
    getTrackListObserver: observeArtistTrackListOld,
});

parserMap.set('new', {
    parseArtist: parseArtistNew,
    parseArtistHome: parseArtistHomeNew,
    getTrackListObserver: observeArtistTrackListNew,
});

export function parseArtist(designStyle) {
    parserMap.get(designStyle).parseArtist();
}

export function getTrackListObserver(designStyle) {
    trackSet.clear();

    /** Making table head columns change place */
    document
        .querySelector('.table-head')
        .insertAdjacentElement('beforeend', elementCreator.createTrackPlayCountElementOld('', false));

    return parserMap.get(designStyle).getTrackListObserver();
}

export function parseArtistHome(designStyle) {
    parserMap.get(designStyle).parseArtistHome();
}

function parseArtistOld() {
    const artist = document.querySelector('.page-artist__title')?.textContent.trim();

    if (!artist) {
        return;
    }

    parseArtistInfo(artist, (playcount) => {
        document
            .querySelector('.d-generic-page-head__main-top')
            .insertAdjacentElement('beforeend', elementCreator.createArtistPlayCountElementOld(playcount));
    });
}

function parseArtistHomeOld() {
    const artist = document.querySelector('.page-artist__title')?.textContent.trim();

    parseArtistTracks(
        Array.from(document.querySelectorAll('.d-track')).map((node) => {
            const title = node.querySelector('.d-track__title')?.textContent.trim();
            trackSet.add(`${artist} - ${title}`);

            return { artist, title, node };
        }),
        (node, playCount) => {
            node.insertAdjacentElement('beforeend', elementCreator.createTrackPlayCountElementOld(playCount));
        }
    );
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

    parseArtistTracks(
        Array.from(document.querySelectorAll('.d-track')).map((node) => {
            const title = node.querySelector('.d-track__title')?.textContent.trim();
            trackSet.add(`${artist} - ${title}`);

            return { artist, title, node };
        }),
        insertTrackOld
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
            parseArtistTracks(newTracks, insertTrackOld);
        }
    });

    observer.observe(trackList, {
        childList: true,
    });

    return observer;
}

function parseArtistNew() {
    const artist = document.querySelector('.PageHeaderTitle_title__caKyB')?.textContent.trim();

    if (!artist) {
        return;
    }

    parseArtistInfo(artist, (playcount) => {
        document
            .querySelector('.PageHeaderBase_meta__bMvfR')
            .insertAdjacentElement('beforeend', elementCreator.createArtistPlayCountElementNew(playcount));
    });
}

function parseArtistHomeNew() {
    const artist = document.querySelector('.PageHeaderTitle_title__caKyB')?.textContent.trim();

    parseArtistTracks(
        Array.from(document.querySelectorAll('.HorizontalCardContainer_root__YoAAP')).map((node) => {
            const title = node.querySelector('.Meta_title__GGBnH')?.textContent.trim();
            trackSet.add(`${artist} - ${title}`);

            return { artist, title, node };
        }),
        (node, playCount) => {
            node.insertAdjacentElement('beforeend', elementCreator.createTrackPlayCountElementNew(playCount));
        }
    );
}

function observeArtistTrackListNew() {
    let trackList = null;

    while (trackList === null) {
        trackList = document.querySelector('.lightlist__cont');
    }

    const artist = document.querySelector('.page-artist__title')?.textContent.trim();

    if (!artist) {
        return;
    }

    parseArtistTracks(
        Array.from(document.querySelectorAll('.d-track')).map((node) => {
            const title = node.querySelector('.d-track__title')?.textContent.trim();
            trackSet.add(`${artist} - ${title}`);

            return { artist, title, node };
        }),
        insertTrackOld
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
            parseArtistTracks(newTracks, insertTrackOld);
        }
    });

    observer.observe(trackList, {
        childList: true,
    });

    return observer;
}

function parseArtistTracks(tracks, insertNode) {
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
                    insertNode(node, data.playcount);
                });
        })
    );
}

function parseArtistInfo(artist, insertArtist) {
    api.getArtist(artist)
        .then((response) => response.json())
        .then((data) => {
            if (data.message) {
                data.playcount = 'No data';
            }

            insertArtist(data.playcount);
        });
}

function insertTrackOld(node, playCount) {
    node.insertAdjacentElement('beforeend', elementCreator.createTrackPlayCountElementOld(playCount));
}

function insertTrackNew(node, playCount) {
    node.insertAdjacentElement('beforeend', elementCreator.createTrackPlayCountElementNew(playCount));
}
