// Empty constructor
function cmhPlugin() {}


cmhPlugin.prototype.getFingerprints = async function(urlTested){
  //synchronous function with promise to get Fingerprints from URL
  return new Promise((resolve, reject) => {
    cordova.exec((fingerprintsJSON) => {
      resolve(fingerprintsJSON)
    }, (errorUser) => {
      reject(errorUser)
    }, "cmhPlugin", "getFingerprints", [urlTested]);
  });
};

cmhPlugin.prototype.getFingerprintsFromCheckServer = function(checkServerURL, host, port){
  const urlPort = port || 443;
  const URL = checkServerURL;

  //synchronous function with promise to get Fingerprints from check server
  return new Promise((resolve, reject) => {
    cordova.exec((CmhServerCert) => {
      resolve(CmhServerCert)
    }, (errorServer) => {
      reject(errorServer)
    }, "cmhPlugin", "getFingerprintsFromCheckServer", [URL, host, urlPort]);
  });
};


// Install of constructor that binds CMH plugin to window
cmhPlugin.install = function() {
  if (!window.plugins) {
    window.plugins = {};
  }
  window.plugins.cmhPlugin = new cmhPlugin();
  return window.plugins.cmhPlugin;
};
cordova.addConstructor(cmhPlugin.install);