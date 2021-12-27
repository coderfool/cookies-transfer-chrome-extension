chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    chrome.cookies.getAll({url: request.url}, cookies => {
        sendResponse(cookies)
    })
    return true
});