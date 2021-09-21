function getQueryValue(url, key) {
    let arr = url.split('?')[1].split('#')[0].split('&')
    let resObj = {}
    arr.forEach(element => {
        const [key, value] = element.split('=')
        resObj[key] = value
    });
    if (!resObj.hasOwnProperty(key)) return false
    else return resObj[key]
}