import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from '@ionic/angular';

import { TranslateService } from '@ngx-translate/core';
import { GlobalProvider } from "../../providers/global/global";


@Component({
  selector: 'page-modal',
  templateUrl: 'modal.html',
  styleUrls: ['modal.scss'],
})
export class ModalPage {
  image:string;
  message:any;
  alert:any;

  constructor(public navCtrl: NavController, public viewCtrl : ModalController, public navParams: NavParams, public translate: TranslateService, public global: GlobalProvider) {
  }

  async ngOnInit() {
    this.image = this.navParams.get('image');
    this.message = await this.global.getTranslation(this.navParams.get('message'));
    this.alert = await this.global.getTranslation('alert');
  }

  public closeModal(){
    this.viewCtrl.dismiss();
  }

}
