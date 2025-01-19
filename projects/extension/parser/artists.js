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
    const artist = document.querySelector('.page-artist__title').textContent.trim();

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

    const artists = document.querySelector('.d-artists > a').textContent.trim();

    Promise.all(
        Array.from(document.querySelectorAll('.d-track')).map((node) => {
            const title = node.querySelector('.d-track__name > a')?.textContent.trim();

            return api
                .getTrack(artists, title)
                .then((response) => response.json())
                .then((data) => {
                    if (data.message) {
                        data.playcount = 'No data';
                    }

                    node.querySelector('.d-track__overflowable-column').insertAdjacentElement(
                        'beforeend',
                        elementCreator.createAlbumTrackPlayCountElementOld(data.playcount, title)
                    );
                });
        })
    );
}
