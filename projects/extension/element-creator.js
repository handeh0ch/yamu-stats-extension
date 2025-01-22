export function createTrackPlayCountElementOld(playCount) {
    const container = document.createElement('div');
    container.className = 'd-track__quasistatic-column';
    container.style.flex = '0 1 10%';

    const nameElement = document.createElement('div');
    nameElement.className = 'd-track__name';
    nameElement.title = playCount;

    const separatorSpan = document.createElement('span');
    separatorSpan.innerHTML = '|';
    separatorSpan.style.color = '#777';
    separatorSpan.style.marginRight = '15px';

    const playCountText = document.createElement('span');
    playCountText.className = 'd-track__title';
    playCountText.style.color = '#777';
    playCountText.innerHTML = playCount;

    nameElement.appendChild(separatorSpan);
    nameElement.appendChild(playCountText);
    container.appendChild(nameElement);

    return container;
}

export function createAlbumPlayCountElementOld(playCount) {
    const container = document.createElement('div');
    container.className = 'd-album-summary d-album-summary__large';

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

export function createArtistPlayCountElementOld(playCount) {
    const container = document.createElement('div');
    container.className = 'page-artist__summary typo deco-typo-secondary';
    container.style.display = 'flex';
    container.style.alignItems = 'center';

    const descriptionSpan = document.createElement('span');
    descriptionSpan.textContent = 'Last.fm';
    descriptionSpan.style.color = '#777';

    const separator = document.createElement('span');
    separator.style.display = 'inline-block';
    separator.style.width = '2px';
    separator.style.height = '2px';
    separator.style.margin = '-2px 6px 0';
    separator.style.content = '""';
    separator.style.overflow = 'hidden';
    separator.style.verticalAlign = 'middle';
    separator.style.backgroundColor = '#d8d8d8';
    separator.style.borderRadius = '100%';
    separator.innerHTML = '&nbsp;';

    const playCountSpan = document.createElement('span');
    playCountSpan.textContent = playCount;
    playCountSpan.style.color = '#777';

    container.appendChild(playCountSpan);
    container.appendChild(separator);
    container.appendChild(descriptionSpan);

    return container;
}
