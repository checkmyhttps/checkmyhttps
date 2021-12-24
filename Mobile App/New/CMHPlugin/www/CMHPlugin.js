var exec = require('cordova/exec');

/*module.exports.getFingerprints = async function (urlTested) {
    exec(function() {}, function() {}, 'CMHPlugin', 'getFingerprints', [urlTested]);
};*/

module.exports.getFingerprints = async function (urlTested) {
    //synchronous function with promise to get Fingerprints from URL
    return new Promise((resolve, reject) => {
        exec((fingerprintsJSON) => { resolve(fingerprintsJSON) }, (errorUser) => { reject(errorUser) }, "CMHPlugin", "getFingerprints", [urlTested]);
        return;
    });
};


module.exports.getFingerprintsFromCheckServer = async function (urlTested, urlHost, urlPort) {
    exec(function() {}, function() {}, 'CMHPlugin', 'getFingerprintsFromCheckServer', [urlTested, urlHost, urlPort]);
};