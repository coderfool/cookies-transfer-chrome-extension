exportForm = document.getElementById('export-form')
importForm = document.getElementById('import-form')

exportForm.onsubmit = event => {
    event.preventDefault()
    const domain = document.getElementById('domain').value
    chrome.runtime.sendMessage({domain: domain}, cookies => {
        const url = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cookies, null, 4))
        const filename = `${domain.split('.')[0]}.json`
        chrome.downloads.download({url: url, filename: filename})
    });
}

importForm.onsubmit = (event) => {
    event.preventDefault()
    const file = document.getElementById('cookies-json').files[0]
    const url = document.getElementById('url').value
    const reader = new FileReader()
    reader.readAsText(file, 'UTF-8')
    reader.onload = () => {
        try {
            const cookies = JSON.parse(reader.result)
            const promises = []
            for (let cookie of cookies) {
                promises.push(chrome.cookies.set({
                    domain: cookie.domain,
                    expirationDate: Date.parse(new Date('2100-12-31')) / 1000,
                    httpOnly: cookie.httpOnly,
                    name: cookie.name,
                    path: cookie.path,
                    sameSite: cookie.sameSite,
                    secure: cookie.secure,
                    storeId: cookie.storeId,
                    url: url,
                    value: cookie.value
                }))
            }
            Promise.all(promises)
            .then(cookies => {
                alert(`Done, set ${cookies.length} cookies.`)
            })
            .catch(err => {
                alert(err)
            })
        } catch (e) {
            if (e instanceof SyntaxError) {
                alert('Invalid JSON')
            }
            else {
                alert(e.message)
            }
        }
    }
}