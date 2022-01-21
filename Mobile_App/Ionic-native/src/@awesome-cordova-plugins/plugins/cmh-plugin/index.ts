import { Injectable } from '@angular/core';
import { IonicNativePlugin, cordova } from '@ionic-native/core';

@Injectable()
export class CMHPlugin extends IonicNativePlugin {
    static pluginName = 'CMHPlugin';
    static plugin = 'fr.esiea.checkmyhttps.cmhplugin';
    static pluginRef = 'cordova.plugins.CMHPlugin';
    static platforms = ['Android'];

    async getFingerprints(urlTested:any): Promise<any> {
        const fingerprints = cordova(this, 'getFingerprints', {}, [{ param1: urlTested}])
        return fingerprints;
    }

    async getFingerprintsFromCheckServer(urlTested: any, urlHost: any, urlPort: any): Promise<any> {
        const fingerprintsFromCheckServer = cordova(this, 'getFingerprintsFromCheckServer', {}, [{ param1: urlTested, param2: urlHost, param3: urlPort }])
        return fingerprintsFromCheckServer;
    }
}