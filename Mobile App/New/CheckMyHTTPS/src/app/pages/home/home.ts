import { Component } from '@angular/core';
import { LoadingController, NavController, NavParams, Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';

import { GlobalProvider } from "../../providers/global/global";

import { TranslateService } from '@ngx-translate/core';

import { Keyboard } from '@capacitor/keyboard';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  styleUrls: ['home.scss'],
  providers: [NavParams]
})
export class HomePage {

  url:any = "https://www."
  punycode:any = require("punycode");

  constructor(public platform: Platform, public navCtrl: NavController, public translate: TranslateService, public global: GlobalProvider, public loadingCtrl: LoadingController) {
    this.initializePage();
  }


  initializePage(){
    const HomePage = this;
    let counter = 0;

    this.platform.ready().then(() => {
      // Android "Share To ..." handle
      if (this.platform.is('android')) {
        //Chrome - creates new App Window
        if(counter !== 1){
          window['plugins'].intent.getCordovaIntent(function (Intent) {
            if(Intent.extras !== undefined ){
              HomePage.url = Intent.extras["android.intent.extra.TEXT"];
              //Avoid check when app is launched by the user (logo)
              if (HomePage.url !== undefined){
                HomePage.presentLoadingDefault();
                counter++;
              }
            }
          }, function () {
          });
        }

        //Firefox - keeps the same App Window
        window['plugins'].intent.setNewIntentHandler(function (Intent) {
          if (Intent.extras != undefined){
            HomePage.url = Intent.extras["android.intent.extra.TEXT"];
            //Avoid check when app is launched by the user (logo)
            if (HomePage.url !== undefined){
              HomePage.presentLoadingDefault();
            }
          }
        }, function () {
        });
      }
    });
  }



  async isCheckableUrl(urlTested){
    //Check if an URL is valid
    const [ , scheme, host, ] = urlTested.match(/^(\w+):\/\/?([a-zA-Z0-9_\-\.]+)(?::([0-9]+))?\/?.*?$/)
    if (scheme !== 'https') {
      this.global.CMHAlert(await this.global.getTranslation('noHttps'));
      // this.global.CMHAlert(this.global.getTranslatedJSON('noHttps'));
      return true;
    }

    // Check private IP
    if (host.match(/^((127\.)|(10\.)|(172\.1[6-9]\.)|(172\.2[0-9]\.)|(172\.3[0-1]\.)|(192\.168\.))+[0-9\.]+/)) {
      this.global.CMHAlert(await this.global.getTranslation('privateIp'));

      return true;
    }

    return true;
  }


  compareFingerprints(userCert:any, checkServerFingerprints:any){
    return (userCert.sha256 === checkServerFingerprints.sha256);
  }

  isUnicode(hostTested:any, nbCertificates:any){
    let res;
    const names = hostTested.split(".");
    for (const i in names) {
      if (names[i].startsWith("xn--")) {
        res = "IDN";
        break;
      }
      else{
        if (nbCertificates === 2){
          res = 'SC';
        }
        else{
          res = 'OK';
        }
      }
    }
    return res;
  }


  verifyCertificate(hostTested:any, userFingerprints:any, APIServerData:any){
    // Checks the client's certificate with the one received by the check server
    let res:any, firstKey:any, secondKey:any;
    let counter = 0

    firstKey= Object.keys(userFingerprints)[0];

    //verify certificates fingerprints from user and check server (2 max)
    if(!this.compareFingerprints(userFingerprints[firstKey], APIServerData.fingerprints)){
      counter++;
      if (APIServerData.whitelisted){
        res = "Whitelisted";
      }
      else{
        if (typeof APIServerData.issuer !== "undefined") {
          //Get the issuer of the certificate (user side)
          secondKey = Object.keys(userFingerprints)[1];

          if(!this.compareFingerprints(userFingerprints[secondKey], APIServerData.issuer.fingerprints)){
            res = "KO";
          }
          else{
            counter++;
            res = this.isUnicode(hostTested, counter);
          }
        }
        else{
          res = "KO";
        }
      }
    }
    else{
      res = this.isUnicode(hostTested, counter);
    }
    return res;
  }



  async getCertFromCheckServer(urlTested:any, urlHost:any, urlPort:any){

    try{
      const data = await window['plugins'].cmhPlugin.getFingerprintsFromCheckServer(urlTested, urlHost, urlPort);
      return data;
    }
    catch (err){
    }
  }


  async getFingerprintsUrl(urlTested){
    // Get fingerprints (from client)
    try{
      console.log(window)
      console.log(window['plugins'])
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

  async setDefaultURL(){
    //set URL in input
    this.url = await this.global.getDefaultURL();
  }

  async presentLoadingDefault() {
    if (Capacitor.isPluginAvailable('Keyboard')) { 
      Keyboard.hide();
    }

    let contentValue:any = await this.global.getTranslation('onGoingCheck');
    let loading = this.loadingCtrl.create({
      message: contentValue,
      cssClass: 'loadingCtrlCustomCss'
    });

    (await loading).present();

    if(this.checkURL()){
      (await loading).dismiss();
    }
  }


  async checkURL(){
    //Check an URL
    const urlTested = this.url;

    const pattern = /^(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@\-\/]))?/;

    //get registered check server
    const checkServer = await this.global.getCheckServer();

    const checkServerFingerprints = {
      "sha256": checkServer.sha256
    };

    if (pattern.test(urlTested)){
      if (await !this.isCheckableUrl(urlTested)) {
        return true;
      }

      //Regex to get the host and port of the tested URL
      const [ , , urlHost, urlPort ] = urlTested.match(/^(\w+):\/\/?([a-zA-Z0-9_\-\.]+)(?::([0-9]+))?\/?.*?$/);

      const userFingerprints = await this.getFingerprintsUrl(urlTested);
      const checkServerData = await this.getCertFromCheckServer(checkServer.url, urlHost, urlPort);


      //########### Handling Java Exceptions from cmhplugin #################

      if (userFingerprints === "SSLHandshakeException"){
        if(checkServerData.APIInfo.error === "HOST_UNREACHABLE"){
          this.global.CMHAlert(await this.global.getTranslation('serverUnreachable'));
          return true;
        }
        else{
          this.global.presentProfileModal('invalid','danger');
          return true;
        }
      }
      else if (userFingerprints === "Punycode"){
        this.global.presentProfileModal('warning','alertOnUnicodeIDNDomainNames');
        return true;
      }
      else if(userFingerprints == undefined && checkServerData.APIInfo.error === "HOST_UNREACHABLE"){
        this.global.CMHAlert(await this.global.getTranslation('serverUnreachable'));
        return true;
      }
      else if (userFingerprints === "UnknownHostException" || checkServerData === undefined){
        this.global.CMHAlert((await this.global.getTranslation('serverUnreachable')));
        return true;
      }
      else if (userFingerprints === "SSLPeerUnverifiedException"){
        this.global.presentProfileModal('unknown','SSLPeerUnverified');
        return true;
      }

      const serverCert = checkServerData.fingerprints;
      const APIServerData = checkServerData.APIInfo;

      //SSL Pinning
      if ((serverCert !== null) && (!this.compareFingerprints(serverCert.cert0, checkServerFingerprints))){
        this.global.presentProfileModal('invalid','sslPinning');
        return true;
      }

      const res = this.verifyCertificate(this.punycode.toASCII(urlHost),userFingerprints, APIServerData);

      switch (res){
        case 'OK':
          this.global.presentProfileModal('valid','secureConnection');
          break;
        case 'SC':
          this.global.presentProfileModal('unknown','severalCertificates');
          break;
        case 'KO':
          this.global.presentProfileModal('invalid','danger');
          break;
        case 'IDN':
          this.global.presentProfileModal('warning','alertOnUnicodeIDNDomainNames');
          break;
        case 'Whitelisted':
          this.global.presentProfileModal('warning','whitelisted');
          break;
      }

      return true;

    }
    else {
      this.global.CMHAlert((await this.global.getTranslation('notURL')));
      return true;
    }
  }
}
