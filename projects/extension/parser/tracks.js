let api;
let elementCreator;

(async function () {
    api = await import(chrome.runtime.getURL('api.js'));
    elementCreator = await import(chrome.runtime.getURL('element-creator.js'));
})();

const parserMap = new Map();
const trackSet = new Set();

parserMap.set('old', {
    getObserver: observeOld,
});

parserMap.set('new', {
    getObserver: observeNew,
});

export function parse(designStyle) {
    trackSet.clear();

    if (designStyle === 'old') {
        /** Making table head columns change place */
        document
            .querySelector('.table-head')
            .insertAdjacentElement('beforeend', elementCreator.createTrackPlayCountElementOld('', false));
    }

    return parserMap.get(designStyle).getObserver();
}

function observeOld() {
    let trackList = null;

    while (trackList === null) {
        trackList = document.querySelector('.lightlist__cont');
    }

    fetchTracks(
        Array.from(trackList.querySelectorAll('.d-track')).map((node) => {
            const artist = node.querySelector('.d-track__artists > a')?.textContent.trim();
            const title = node.querySelector('.d-track__title')?.textContent.trim();
            trackSet.add(`${artist} - ${title}`);

            return { artist, title, node };
        }),
        insertNodeOld
    );

    const observer = new MutationObserver((mutations) => {
        const newTracks = [];

        mutations.forEach((mutation) => {
            Array.from(mutation.addedNodes).forEach((node) => {
                const artist = node.querySelector('.d-track__artists > a')?.textContent.trim();
                const title = node.querySelector('.d-track__title')?.textContent.trim();

                if (node.nodeType === Node.ELEMENT_NODE && !trackSet.has(`${artist} - ${title}`)) {
                    trackSet.add(`${artist} - ${title}`);
                    newTracks.push({ artist, title, node });
                }
            });
        });

        if (newTracks.length > 0) {
            fetchTracks(newTracks, insertNodeOld);
        }
    });

    observer.observe(trackList, {
        childList: true,
    });

    return observer;
}

function observeNew() {
    let trackList = null;

    while (trackList === null) {
        trackList = document.querySelector('.PlaylistPage_content__T7zOm');
    }

    fetchTracks(
        Array.from(trackList.querySelectorAll('.HorizontalCardContainer_root__YoAAP')).map((node) => {
            const artist = node.querySelector('.Meta_artistCaption__JESZi')?.textContent.trim();
            const title = node.querySelector('.Meta_title__GGBnH')?.textContent.trim();
            trackSet.add(`${artist} - ${title}`);

            return { artist, title, node };
        }),
        insertNodeNew
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
                        const artist = node.querySelector('.Meta_artistCaption__JESZi')?.textContent.trim();
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
            fetchTracks(newTracks, insertNodeNew);
        }
    });

    observer.observe(trackList, {
        childList: true,
    });

    return observer;
}

function fetchTracks(newTracks, insertNode) {
    Promise.all(
        newTracks.map(({ artist, title, node }) => {
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

function insertNodeOld(node, playCount) {
    node.insertAdjacentElement('beforeend', elementCreator.createTrackPlayCountElementOld(playCount));
}

function insertNodeNew(node, playCount) {
    node.insertBefore(
        elementCreator.createTrackPlayCountElementNew(playCount),
        node.querySelector('.ControlsBar_root__5HK2B')
    );
}
