var exec = require('cordova/exec');
/*
module.exports.getFingerprints = function (urlTested) {
    exec(function() {}, function() {}, 'CMHPlugin', 'getFingerprints', [urlTested]);
};*/

module.exports.getFingerprints = async function (fingerprintsJSON, success , errorUser) {
    exec(fingerprintsJSON, errorUser, "CMHPlugin", "getFingerprints", [urlTested]);
};


module.exports.getFingerprintsFromCheckServer = async function (urlTested, urlHost, urlPort) {
    console.log("export getFingerprintsFromCheckServer")
    let test = await exec((fingerprintsJSON) => {return fingerprintsJSON}, (errorUser) => {return errorUser}, 'CMHPlugin', 'getFingerprintsFromCheckServer', [urlTested, urlHost, urlPort]);
    console.log(test)
};