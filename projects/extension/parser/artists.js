let api;
let elementCreator;

(async function () {
    api = await import(chrome.runtime.getURL('api.js'));
    elementCreator = await import(chrome.runtime.getURL('element-creator.js'));
})();

const parserMap = new Map();

parserMap.set('old', {
    parseArtist: parseArtistOld,
    parseArtistTracks: parseAlbumTracksOld,
});

export function parseArtist(designStyle) {
    getParser(designStyle).parseArtist();
}

export function parseArtistTracks(designStyle) {
    getParser(designStyle).parseArtistTracks();
}

function getParser(designStyle) {
    return parserMap.get(designStyle);
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

function parseAlbumTracksOld() {
    let trackList = null;

    while (trackList === null) {
        trackList = document.querySelector('.lightlist__cont');
    }

    const artist = document.querySelector('.page-artist__title')?.textContent.trim();

    if (!artist) {
        return;
    }

    Promise.all(
        Array.from(document.querySelectorAll('.d-track')).map((node) => {
            const title = node.querySelector('.d-track__title')?.textContent.trim();

            return api
                .getTrack(artist, title)
                .then((response) => response.json())
                .then((data) => {
                    if (data.message) {
                        data.playcount = 'No data';
                    }

                    node.insertBefore(
                        elementCreator.createTrackPlayCountElementOld(data.playcount),
                        node.querySelector('.d-track__overflowable-column')
                    );
                });
        })
    );
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
