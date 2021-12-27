exportForm = document.getElementById('export-form')
importForm = document.getElementById('import-form')

exportForm.onsubmit = event => {
    event.preventDefault()
    const inputURL = document.getElementById('url').value
    chrome.runtime.sendMessage({url: inputURL}, cookies => {
        for (let cookie of cookies) {
           cookie.url = inputURL
        }
        const url = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cookies, null, 4))
        chrome.downloads.download({url: url})
    });
}

importForm.onsubmit = event => {
    event.preventDefault()
    const file = document.getElementById('cookies-json').files[0]
    const reader = new FileReader()
    reader.readAsText(file, 'UTF-8')
    reader.onload = () => {
        try {
            const cookies = JSON.parse(reader.result)
            let promises = []
            for (let cookie of cookies) {
                promises.push(chrome.cookies.remove({
                    name: cookie.name,
                    storeId: cookie.storeId,
                    url: cookie.url
                }))
            }
            Promise.all(promises)
            .then(_cookies => {
                promises = []
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
                        url: cookie.url,
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