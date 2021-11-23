import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from '@ionic/angular';

import { GlobalProvider } from "../../providers/global/global";
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { Keyboard } from '@capacitor/keyboard';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
  providers: [NavParams]
})

export class SettingsPage {
  checkServerAddress:any;
  checkServerSha256:any;

  toogle:boolean;

  defaultURL:any;

  constructor(public navCtrl: NavController, private storage: Storage, public navParams: NavParams, public global: GlobalProvider, public translate: TranslateService, public loadingCtrl: LoadingController) {
    this.displayCHECKSERVER();

    this.displayDefaultURL();

    //Toogle position changes according to the theme
    this.storage.get("toogle").then((result) =>{
      this.toogle = result;
    });
  }


  async displayCHECKSERVER() {
    this.checkServerAddress = await this.global.getServerURL();
    this.checkServerSha256 = await this.global.getSHA256();
    
  }

  async displayDefaultURL(){
    this.defaultURL = await this.global.getDefaultURL();
  }

  setCHECKSERVER(checkServerAddress, checkServerSha256){
    this.global.setURL(checkServerAddress);
    this.global.setSHA256(checkServerSha256);
  }

  async newCheckServer(){
    this.setCHECKSERVER(this.checkServerAddress,this.checkServerSha256);
    this.global.presentProfileModal("server", "newCheckServer");
  }

  defaultCheckServer(){
    this.setCHECKSERVER("https://checkmyhttps.net","8B944DBC442DA0892C307DEF6C971B671267BF033E8479C567E173973F970B9F");
    this.displayCHECKSERVER();
    this.global.presentProfileModal("server", "newCheckServer");
  }

  onChange(){
    Keyboard.hide();
    //for displa
    this.checkServerSha256 = "";
    this.setCHECKSERVER(this.checkServerAddress, "");
    this.displayCHECKSERVER();
  }


  //################################################################################

  async presentLoadingDefault() {
    Keyboard.hide();
    let contentValue:any = await this.global.getTranslation('onGoingCheck');
    let loading = this.loadingCtrl.create({
      message: contentValue,
      cssClass: 'loadingCtrlCustomCss'
    });

    (await loading).present;

    if(this.findFingerprints()){
      (await loading).dismiss;
    }
  }

  async getFingerprintsUrl(urlTested){
    // Get fingerprints (from client)

    try{
      const data = await window['plugins'].cmhPlugin.getFingerprints(urlTested);
      return data;
    }
    catch (err){

      if (err.includes("SSLHandshakeException")){
        if(err.includes("SSL handshake aborted")){
          return "UnknownHostException";
        }
        else{
          return "SSLHandshakeException";
        }
      }
      else if (err.includes("UnknownHostException")){
        if(err.includes("Invalid host")){
          return "Punycode";
        }
        else{
          return "UnknownHostException";
        }
      }
      else if (err.includes("SSLPeerUnverifiedException")){
        return "SSLPeerUnverifiedException";
      }
    }
  }

  async findFingerprints(){
    const fingerprints = await this.getFingerprintsUrl(this.checkServerAddress);
    if (fingerprints === "SSLHandshakeException"){
      this.global.presentProfileModal('invalid','danger');
      return true;
    }
    //First verify if it's punycode because of the Java exception
    else if (fingerprints === "Punycode"){
      this.global.presentProfileModal('warning','alertOnUnicodeIDNDomainNames');
      return true;
    }
    else if (fingerprints === "UnknownHostException"){
      this.global.CMHAlert(await this.global.getTranslation('serverUnreachable'));
      return true;
    }
    else if (fingerprints === "SSLPeerUnverifiedException"){
      this.global.presentProfileModal('unknown','SSLPeerUnverified');
      return true;
    }

    //for display
    this.checkServerSha256 = fingerprints.cert0.sha256;
    this.setCHECKSERVER(this.checkServerAddress,this.checkServerSha256);
    this.displayCHECKSERVER();
    this.global.presentProfileModal('server', 'newCheckServer');
    return true;
  }

  //##################################################################

  changeTheme(){
    //this.event.publish('theme:toogle');
  }

  async changeDefaultURL(){
    this.global.setDefaultURL(this.defaultURL);
    Keyboard.hide();
    this.displayDefaultURL();
    this.global.presentProfileModal('www', 'newDefaultURL');
  }

}
