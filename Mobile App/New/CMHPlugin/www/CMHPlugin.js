var exec = require('cordova/exec');

module.exports.getFingerprints = async function (urlTested, fingerprintsJSON, errorUser) {
    exec(fingerprintsJSON, errorUser, "CMHPlugin", "getFingerprints", [urlTested]);
};


module.exports.getFingerprintsFromCheckServer = async function (checkServerURL, host, port, CmhServerCert, errorUser) {
    console.log("export getFingerprintsFromCheckServer")
    exec(CmhServerCert, errorUser, "CMHPlugin", "getFingerprintsFromCheckServer", [checkServerURL, host, port]);
};