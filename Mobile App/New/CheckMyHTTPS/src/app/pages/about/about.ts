import { Component } from '@angular/core';
import { NavController, NavParams } from '@ionic/angular';


@Component({
  selector: 'page-about',
  templateUrl: './about.html',
  styleUrls: ['./about.scss'],
  providers: [NavParams]
})
export class AboutPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

}
