let api;
let elementCreator;

(async function () {
    api = await import(chrome.runtime.getURL('api.js'));
    elementCreator = await import(chrome.runtime.getURL('element-creator.js'));
})();

const parserMap = new Map();

parserMap.set('old', {
    parseAlbum: parseAlbumOld,
    parseAlbumTracks: parseAlbumTracksOld,
});

parserMap.set('new', {
    parseAlbum: parseAlbumNew,
    parseAlbumTracks: parseAlbumTracksNew,
});

export function parseAlbum(designStyle) {
    getParser(designStyle).parseAlbum();
}

export function parseAlbumTracks(designStyle) {
    getParser(designStyle).parseAlbumTracks();
}

function getParser(designStyle) {
    return parserMap.get(designStyle);
}

function parseAlbumOld() {
    const albumData = document.querySelector('.d-generic-page-head__main-top');

    const title = albumData.querySelector('.page-album__title > span, .page-album__title > a')?.textContent.trim();
    const artist = albumData.querySelector('.d-artists > a')?.textContent.trim();

    if (!title || !artist) {
        return;
    }

    fetchAlbum(artist, title, albumData, (node, playcount) => {
        node.insertBefore(
            elementCreator.createAlbumPlayCountElementOld(playcount),
            document.querySelector('.d-album-summary')
        );
    });
}

function parseAlbumTracksOld() {
    let trackList = null;

    while (trackList === null) {
        trackList = document.querySelector('.lightlist__cont');
    }

    const artist = document.querySelector('.d-artists > a')?.textContent.trim();

    if (!artist) {
        return;
    }

    fetchTracks(
        Array.from(trackList.querySelectorAll('.d-track')).map((node) => {
            const title = node.querySelector('.d-track__name > a')?.textContent.trim();

            return { artist, title, node };
        }),
        (node, playcount) => {
            node.querySelector('.d-track__overflowable-column').insertAdjacentElement(
                'beforeend',
                elementCreator.createTrackPlayCountElementOld(playcount)
            );
        }
    );
}

function parseAlbumNew() {
    const albumData = document.querySelector('.PageHeaderBase_info__GRcah');

    const title = albumData.querySelector('.PageHeaderTitle_title__caKyB')?.textContent.trim();
    const artist = albumData.querySelector('.PageHeaderAlbumMeta_artistLabel__2WZSM')?.textContent.trim();

    if (!title || !artist) {
        return;
    }

    fetchAlbum(artist, title, albumData, (node, playcount) => {
        node.insertBefore(
            elementCreator.createHeaderPlayCountElementNew(playcount, false),
            node.querySelector('.PageHeaderBase_meta__bMvfR')
        );
    });
}

function parseAlbumTracksNew() {
    let trackList = null;

    while (trackList === null) {
        trackList = document.querySelector('.AlbumPage_content__1JXxB');
    }

    const artist = document.querySelector('.PageHeaderAlbumMeta_artistLabel__2WZSM')?.textContent.trim();

    fetchTracks(
        Array.from(trackList.querySelectorAll('.HorizontalCardContainer_root__YoAAP')).map((node) => {
            const title = node.querySelector('.Meta_title__GGBnH')?.textContent.trim();

            return { artist, title, node };
        }),
        insertTrackNew
    );

    const observer = new MutationObserver(async (mutations) => {
        const newTracks = [];
        const promises = [];

        mutations.forEach((mutation) => {
            Array.from(mutation.addedNodes).forEach((node) => {
                if (node.nodeType !== Node.ELEMENT_NODE) {
                    return;
                }

                const promise = new Promise((resolve) => {
                    const interval = setInterval(() => {
                        if (node.querySelector('.AlbumPage_textItem__1T3qL')) {
                            clearInterval(interval);
                            resolve();
                        }

                        const title = node.querySelector('.Meta_title__GGBnH')?.textContent.trim();

                        if (artist && title) {
                            newTracks.push({
                                artist,
                                title,
                                node: node.querySelector('.HorizontalCardContainer_root__YoAAP'),
                            });
                            clearInterval(interval);
                            resolve();
                        }
                    }, 200);
                });

                promises.push(promise);
            });
        });

        await Promise.all(promises);

        if (newTracks.length > 0) {
            fetchTracks(newTracks, insertTrackNew);
        }
    });

    observer.observe(trackList, {
        childList: true,
    });

    return observer;
}

function fetchAlbum(artist, title, node, insertNode) {
    api.getAlbum(artist, title)
        .then((response) => response.json())
        .then((data) => {
            if (data.message) {
                data.playcount = 'No data';
            }

            insertNode(node, data.playcount);
        });
}

function fetchTracks(newTracks, insertNode) {
    Promise.all(
        Array.from(newTracks).map(({ artist, title, node }) => {
            return api
                .getTrack(artist, title)
                .then((response) => response.json())
                .then((data) => {
                    if (data.message) {
                        data.playcount = 'No data';
                    }

                    insertNode(node, data.playcount);
                });
        })
    );
}

function insertTrackNew(node, playCount) {
    node.insertBefore(
        elementCreator.createTrackPlayCountElementNew(playCount),
        node.querySelector('.ControlsBar_root__5HK2B')
    );
}
