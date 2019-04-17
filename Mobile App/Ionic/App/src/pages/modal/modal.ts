import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { ViewController } from 'ionic-angular';
import {TranslateService} from '@ngx-translate/core';
import {GlobalProvider} from "../../providers/global/global";



@IonicPage()
@Component({
  selector: 'page-modal',
  templateUrl: 'modal.html',
})
export class ModalPage {
  image:string;
  message:string;
  alert:string;

  constructor(public navCtrl: NavController, public viewCtrl : ViewController, public navParams: NavParams, public translate: TranslateService, public global: GlobalProvider) {
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad ModalPage');
    this.image = this.navParams.get('image');
    this.message = this.global.getTranslatedJSON(this.navParams.get('message'));
    this.alert = this.global.getTranslatedJSON('alert');
  }

  tapScreen(){
    // console.log("touch");
  }

  public closeModal(){
    this.viewCtrl.dismiss();
  }

}
