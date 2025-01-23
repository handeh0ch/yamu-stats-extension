chrome.webNavigation.onCompleted.addListener(
    () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.cookies.get({ url: 'https://music.yandex.ru', name: 'force_next_web' }, (cookie) => {
                chrome.tabs.sendMessage(tabs[0].id, { designStyle: cookie && cookie.value === 'true' ? 'new' : 'old' });
            });
        });
    },
    { url: [{ schemes: ['http', 'https'] }] }
);
