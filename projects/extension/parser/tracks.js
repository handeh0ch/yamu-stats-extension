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

            return fetch(
                `https://yamu-stats-extension-api.vercel.app/api/track?artist=${artist}&name=${title}&service=lastfm`
            )
                .then((response) => response.json())
                .then((data) => {
                    if (data.message) {
                        data.playcount = 'No data :(';
                    }

                    trackSet.add(`${artist} - ${title}`);

                    node.insertBefore(
                        createTrackPlayCountElementOld(data.playcount),
                        node.querySelector('.d-track__overflowable-column')
                    );
                });
        })
    );
}

function createTrackPlayCountElementOld(playCount, title) {
    const playCountElement = document.createElement('div');
    playCountElement.className = 'd-track__quasistatic-column';

    const nameElement = document.createElement('div');
    nameElement.className = 'd-track__name';
    nameElement.title = title;

    const playCountText = document.createElement('span');
    playCountText.className = 'd-track__title';
    playCountText.style.color = '#777';
    playCountText.textContent = playCount;

    nameElement.appendChild(playCountText);
    playCountElement.appendChild(nameElement);

    return playCountElement;
}

function observeNew(designStyle) {
    // TODO
}

function parseNew(newNodes) {
    // TODO
}
