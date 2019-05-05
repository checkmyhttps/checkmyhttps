import {Component} from '@angular/core';
import {LoadingController, NavController, Platform} from 'ionic-angular';

import {GlobalProvider} from "../../providers/global/global";

import {TranslateService} from '@ngx-translate/core';

import { Keyboard } from '@ionic-native/keyboard';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  url:any = "https://www."
  punycode:any = require("punycode");

  constructor(public platform: Platform, public navCtrl: NavController, public translate: TranslateService, public global: GlobalProvider, public loadingCtrl: LoadingController,  private keyboard: Keyboard) {
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
          // console.log(Intent);
            // console.log("chrome")
            // console.log(Intent);
            if(Intent.extras !== undefined ){
              HomePage.url = Intent.extras["android.intent.extra.TEXT"];
              //Avoid check when app is launched by the user (logo)
              if (HomePage.url !== undefined){
                HomePage.presentLoadingDefault();
                counter++;
              }
            }
          }, function () {
            // console.log('Error');
          });
        }

        //Firefox - keeps the same App Window
        window['plugins'].intent.setNewIntentHandler(function (Intent) {
          // console.log("firefox");
          if (Intent.extras != undefined){
            HomePage.url = Intent.extras["android.intent.extra.TEXT"];
            //Avoid check when app is launched by the user (logo)
            if (HomePage.url !== undefined){
              HomePage.presentLoadingDefault();
            }
          }
        }, function () {
          // console.log('Error');
        });
      }
    });
  }



  isCheckableUrl(urlTested){
    //Check if an URL is valid
    const [ , scheme, host, ] = urlTested.match(/^(\w+):\/\/?([a-zA-Z0-9_\-\.]+)(?::([0-9]+))?\/?.*?$/)
    if (scheme !== 'https') {
      this.global.CMHAlert(this.global.getTranslatedJSON('noHttps'));
      return true;
    }

    // Check private IP
    if (host.match(/^((127\.)|(10\.)|(172\.1[6-9]\.)|(172\.2[0-9]\.)|(172\.3[0-1]\.)|(192\.168\.))+[0-9\.]+/)) {
      this.global.CMHAlert(this.global.getTranslatedJSON('privateIp'));

      return true;
    }

    return true;
  }


  compareFingerprints(userCert, checkServerFingerprints){
    // console.log("compare SSL Pinning");
    // console.log("userCert",userCert);
    // console.log("checkServerFingerprints",checkServerFingerprints);

    return (userCert.sha256 === checkServerFingerprints.sha256);

  }

  isUnicode(hostTested, nbCertificates){
    // console.log("isUnicode");
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


  verifyCertificate(hostTested, userFingerprints, APIServerData){
    // Checks the client's certificate with the one received by the check server
    // console.log("Verify Certificate")
    let res, firstKey, secondKey;
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
            //TODO Watch out several certificates
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



  async getCertFromCheckServer(urlTested, urlHost, urlPort){
    // console.log("getFingerprintsServer");
    // console.log(urlTested, urlHost, urlPort);

    try{
      const data = await window['plugins'].cmhPlugin.getFingerprintsFromCheckServer(urlTested, urlHost, urlPort);
      return data;
    }
    catch (err){
      // console.log(err);
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

  async setDefaultURL(){
    //set URL in input
    this.url = await this.global.getDefaultURL();
    // console.log(this.url);
  }

  async presentLoadingDefault() {
    this.keyboard.hide();
    let loading = this.loadingCtrl.create({
      content: this.global.getTranslatedJSON('onGoingCheck'),
      cssClass: 'loadingCtrlCustomCss'
    });

    loading.present();

    if(this.checkURL()){
      loading.dismiss();
    }
  }


  async checkURL(){
    //Check an URL
    const urlTested = this.url;
    // console.log("url", urlTested);

    const pattern = /^(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@\-\/]))?/;

    //get registered check server
    const checkServer = await this.global.getCheckServer();

    const checkServerFingerprints = {
      "sha256": checkServer.sha256
    };

    if (pattern.test(urlTested)){
      if (!this.isCheckableUrl(urlTested)) {
        return true;
      }

      //Regex to get the host and port of the tested URL
      const [ , , urlHost, urlPort ] = urlTested.match(/^(\w+):\/\/?([a-zA-Z0-9_\-\.]+)(?::([0-9]+))?\/?.*?$/);

      const userFingerprints = await this.getFingerprintsUrl(urlTested);
      const checkServerData = await this.getCertFromCheckServer(checkServer.url, urlHost, urlPort);

      // console.log("userFingerprints", userFingerprints);
      // console.log("checkServerData", checkServerData);


      //########### Handling Java Exceptions from cmhplugin #################

      if (userFingerprints === "SSLHandshakeException"){
        if(checkServerData.APIInfo.error === "HOST_UNREACHABLE"){
          // console.log("UnknownHostException");
          this.global.CMHAlert(this.global.getTranslatedJSON('serverUnreachable'));
          return true;
        }
        else{
          this.global.presentProfileModal('invalid','danger');
          return true;
        }
      }
      else if (userFingerprints === "Punycode"){
        // console.log('alertPunycode');
        this.global.presentProfileModal('warning','alertOnUnicodeIDNDomainNames');
        return true;
      }
      else if(userFingerprints == undefined && checkServerData.APIInfo.error === "HOST_UNREACHABLE"){
        // console.log("UnknownHostException");
        this.global.CMHAlert(this.global.getTranslatedJSON('serverUnreachable'));
        return true;
      }
      //checkServerData.APIInfo.error === "HOST_UNREACHABLE"
      else if (userFingerprints === "UnknownHostException" || checkServerData === undefined){
        // console.log("UnknownHostException");
        this.global.CMHAlert(this.global.getTranslatedJSON('serverUnreachable'));
        return true;
      }
      else if (userFingerprints === "SSLPeerUnverifiedException"){
        // console.log("SSLPeerUnverifiedException");
        this.global.presentProfileModal('unknown','SSLPeerUnverified');
        return true;
      }

      const serverCert = checkServerData.fingerprints;
      const APIServerData = checkServerData.APIInfo;

      // console.log("serverCert", serverCert);
      // console.log("checkServerData.APIInfo", checkServerData.APIInfo);

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
      this.global.CMHAlert(this.global.getTranslatedJSON('notURL'));
      return true;
    }
  }
}
