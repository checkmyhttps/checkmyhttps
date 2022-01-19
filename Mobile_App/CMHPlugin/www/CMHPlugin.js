var exec = require('cordova/exec');

module.exports.getFingerprints = async function (params, fingerprintsJSON, errorUser) {
    exec(fingerprintsJSON, errorUser, "CMHPlugin", "getFingerprints", [params.param1]);
};


module.exports.getFingerprintsFromCheckServer = async function (params, CmhServerCert, errorUser) {
    exec(CmhServerCert, errorUser, "CMHPlugin", "getFingerprintsFromCheckServer", [params.param1, params.param2, params.param3]);
};