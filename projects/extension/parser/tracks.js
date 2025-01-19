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
    parse: parseOld,
});

parserMap.set('new', {
    getObserver: observeNew,
    parse: parseNew,
});

export function parse(designStyle) {
    trackSet.clear();
    return parserMap.get(designStyle).getObserver(designStyle);
}

function getParser(designStyle) {
    return parserMap.get(designStyle);
}

function observeOld(designStyle) {
    let trackList = null;

    while (trackList === null) {
        trackList = document.querySelector('.lightlist__cont');
    }

    getParser(designStyle).parse(
        Array.from(document.querySelectorAll('.d-track')).map((node) => {
            const artist = node.querySelector('.d-track__artists > a')?.textContent.trim();
            const title = node.querySelector('.d-track__title')?.textContent.trim();
            trackSet.add(`${artist} - ${title}`);

            return { artist, title, node };
        })
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
            getParser(designStyle).parse(newTracks);
        }
    });

    observer.observe(trackList, {
        childList: true,
        subtree: true,
    });

    return observer;
}

function parseOld(newTracks) {
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

                    node.insertBefore(
                        elementCreator.createTrackPlayCountElementOld(data.playcount),
                        node.querySelector('.d-track__overflowable-column')
                    );
                });
        })
    );
}

function observeNew(designStyle) {
    // TODO
}

function parseNew(newNodes) {
    // TODO
}
