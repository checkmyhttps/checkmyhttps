import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, Events } from 'ionic-angular';

import { GlobalProvider } from "../../providers/global/global";
import {Storage} from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { Keyboard } from '@ionic-native/keyboard';


@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})

export class SettingsPage {
  checkServerAddress:any;
  checkServerSha256:any;

  toogle:boolean;

  defaultURL:any;

  constructor(public navCtrl: NavController, private storage: Storage, public navParams: NavParams, public global: GlobalProvider, public translate: TranslateService, private keyboard: Keyboard, public loadingCtrl: LoadingController, public event: Events) {
    this.displayCHECKSERVER();

    this.displayDefaultURL();

    //Toogle position changes according to the theme
    this.storage.get("toogle").then((result) =>{
      this.toogle = result;
    });
  }


  async displayCHECKSERVER() {
    // console.log("displayCHECKSERVER");
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
    this.setCHECKSERVER("https://checkmyhttps.net","889F63E8E7F98F67E35750591CD66BC32A17A4B4FA2A44763DBEF8D756156165");
    this.displayCHECKSERVER();
    this.global.presentProfileModal("server", "newCheckServer");
  }

  onChange(){
    this.keyboard.hide();
    //for displa
    this.checkServerSha256 = "";
    this.setCHECKSERVER(this.checkServerAddress, "");
    this.displayCHECKSERVER();
  }


  //################################################################################
  async presentLoadingDefault() {
    let loading = this.loadingCtrl.create({
      content: this.global.getTranslatedJSON('pleaseWait'),
      cssClass: 'loadingCtrlCustomCss'
    });

    loading.present();

    if(this.findFingerprints()){
      loading.dismiss();
    }
  }

  async getFingerprintsUrl(urlTested){
    //""" Get fingerprints (from client) """
    // console.log("getFingerprintsUrl");

    try{
      const data = await window['plugins'].cmhPlugin.getFingerprints(urlTested);
      return data;
    }
    catch (err){
      // console.log(err);

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
    // console.log(fingerprints);
    if (fingerprints === "SSLHandshakeException"){
      this.global.presentProfileModal('invalid','danger');
      return true;
    }
    //First verify if it's punycode because of the Java exception
    else if (fingerprints === "Punycode"){
      // console.log('alertPunycode');
      this.global.presentProfileModal('warning','alertOnUnicodeIDNDomainNames');
      return true;
    }
    else if (fingerprints === "UnknownHostException"){
      // console.log("UnknownHostException");
      this.global.CMHAlert(this.global.getTranslatedJSON('serverUnreachable'));
      return true;
    }
    else if (fingerprints === "SSLPeerUnverifiedException"){
      // console.log("SSLPeerUnverifiedException");
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
    // console.log("changeTheme");
    this.event.publish('theme:toogle');
  }

  async changeDefaultURL(){
    this.global.setDefaultURL(this.defaultURL);
    this.keyboard.hide();
    this.displayDefaultURL();
    this.global.presentProfileModal('www', 'newDefaultURL');
  }

}
