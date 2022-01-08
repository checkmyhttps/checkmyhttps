var exec = require('cordova/exec');

module.exports.getFingerprints = async function (urlTested, fingerprintsJSON, errorUser) {
    exec(fingerprintsJSON, errorUser, "CMHPlugin", "getFingerprints", [urlTested]);
};


module.exports.getFingerprintsFromCheckServer = async function (params, CmhServerCert, errorUser) {
    exec(CmhServerCert, errorUser, "CMHPlugin", "getFingerprintsFromCheckServer", [params.param1, params.param2, params.param3]);
};