import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';

import {Storage} from '@ionic/storage';

import { AlertController, ModalController } from 'ionic-angular';

import {TranslateService} from '@ngx-translate/core';


@Injectable()
export class GlobalProvider {

  private CHECKSERVER = {
    url : "https://checkmyhttps.net",
    sha256: "889F63E8E7F98F67E35750591CD66BC32A17A4B4FA2A44763DBEF8D756156165"
  };

  defaultURL:string = "https://www.esiea.fr";


  constructor(public http: HttpClient, private storage: Storage, public modalCtrl: ModalController, public translate: TranslateService, public  alertCtrl: AlertController ) {
    // console.log('Hello GlobalProvider Provider');

  }

  async getCheckServer(){
    //Object check server used in home.ts
    return {
      url: await this.getServerURL(),
      sha256: await this.getSHA256()
    };
  }

  async getServerURL(){
    const url = await this.storage.get('url');
    if (url !== null){
      return url;
    }
    else{
      return this.CHECKSERVER.url;
    }
  }

  async getSHA256(){
    const sha256 = await this.storage.get('sha256');
    if (sha256 !== null){
      return sha256;
    }
    else {
      return this.CHECKSERVER.sha256;
    }
  }

  async setURL(url){
    await this.storage.set("url", url);
  }

  async setSHA256(sha256){
    await this.storage.set("sha256", sha256);
  }



  async getDefaultURL(){
    const url = await this.storage.get('defaultURL');
    // console.log(url);
    if (url !== null){
      return url;
    }
    else{
      return this.defaultURL;
    }
  }
  
  async setDefaultURL(defaultURL){
    await this.storage.set("defaultURL", defaultURL);
  }


  //###################################################################################


  presentProfileModal(image, message) {
    let modalPage = this.modalCtrl.create('ModalPage', { image: image, message: message });
    modalPage.present();
  }

  getTranslatedJSON(key) {
    let text;
    this.translate.get(key).subscribe(translation => {
      text = translation;
    });
    return text;
  }

  CMHAlert(message) {
    let alert = this.alertCtrl.create({
      title: this.getTranslatedJSON('alert'),
      message: message,
      buttons: ['OK'],
      cssClass: 'alertCustomCss'
    });
    alert.present();
  }

  setToogle(themeApp){
    // console.log("themeApp", themeApp)
    if (themeApp === "dark-theme") {
      this.storage.set("toogle", true);
    }
    else{
      this.storage.set("toogle", false);
    }
  }

}
