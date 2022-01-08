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
  message:any;
  alert:any;

  constructor(public navCtrl: NavController, public viewCtrl : ViewController, public navParams: NavParams, public translate: TranslateService, public global: GlobalProvider) {
  }

  async ionViewDidLoad() {
    this.image = this.navParams.get('image');
    this.message = await this.global.getTranslation(this.navParams.get('message'));
    this.alert = await this.global.getTranslation('alert');
  }

  public closeModal(){
    this.viewCtrl.dismiss();
  }

}
