export function createTrackPlayCountElementOld(playCount, title) {
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

export function createAlbumPlayCountElementOld(playCount) {
    const container = document.createElement('div');
    container.className = 'd-album-summary d-album-summary__large';
    container.setAttribute('data-b', '2253');

    const group = document.createElement('div');
    group.className = 'd-album-summary__group d-album-summary__item typo-disabled';

    const year = document.createElement('span');
    year.className = 'typo deco-typo-secondary';
    year.textContent = 'Last.fm';

    const separator = document.createElement('span');
    separator.className = 'separator';
    separator.innerHTML = '&nbsp;';

    const link = document.createElement('span');
    link.className = 'typo deco-typo-secondary';
    link.textContent = playCount;

    group.appendChild(year);
    group.appendChild(separator);
    group.appendChild(link);

    container.appendChild(group);

    return container;
}

export function createAlbumTrackPlayCountElementOld(playCount, title) {
    const playCountElement = document.createElement('div');
    playCountElement.className = 'd-track__quasistatic-column';
    playCountElement.style.flex = '0 1 10%';

    const nameElement = document.createElement('div');
    nameElement.className = 'd-track__name';
    nameElement.title = title;

    const playCountText = document.createElement('span');
    playCountText.className = 'd-track__title';
    playCountText.style.color = '#777';
    playCountText.innerHTML = `&#9;|&#9;${playCount}`;

    nameElement.appendChild(playCountText);
    playCountElement.appendChild(nameElement);

    return playCountElement;
}
