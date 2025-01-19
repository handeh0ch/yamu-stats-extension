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

// parserMap.set('new', {
//     parseAlbum: parseAlbumNew,
//     parseAlbumTracks: parseAlbumTracksNew,
// });

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

    api.getAlbum(artist, title)
        .then((response) => response.json())
        .then((data) => {
            if (data.message) {
                data.playcount = 'No data';
            }

            albumData.insertBefore(
                elementCreator.createAlbumPlayCountElementOld(data.playcount),
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

    Promise.all(
        Array.from(document.querySelectorAll('.d-track')).map((node) => {
            const title = node.querySelector('.d-track__name > a')?.textContent.trim();

            return api
                .getTrack(artist, title)
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
