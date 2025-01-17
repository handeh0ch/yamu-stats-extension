// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//     if (changeInfo.url && tab.url.includes('music.yandex.ru')) {
//         if (
//             changeInfo.url.match(/\/users\/.*\/tracks/) ||
//             changeInfo.url.match(/\/album\/\d+/) ||
//             changeInfo.url.match(/\/artist\/\d+/)
//         ) {
//             chrome.scripting.executeScript({
//                 target: { tabId: tabId },
//                 files: ['content.js'],
//             });
//         }
//     }
// });
