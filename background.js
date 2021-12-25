chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    chrome.cookies.getAll({domain: request.domain}, (cookies) => {
        sendResponse(cookies)
    })
    return true
});