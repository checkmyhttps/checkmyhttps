import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HomePage } from "../home/home";

import {TranslateService} from '@ngx-translate/core';
import {GlobalProvider} from "../../providers/global/global";


@IonicPage()
@Component({
  selector: 'page-intro',
  templateUrl: 'intro.html',
})
export class IntroPage {

  slides = [
    {
      title: this.global.getTranslatedJSON('TitreIntro1'),
      description: this.global.getTranslatedJSON('Intro1'),
      image: "../../assets/imgs/home.png",
    },
    {
      title: this.global.getTranslatedJSON('TitreIntro2'),
      description: this.global.getTranslatedJSON('Intro2'),
      image: "../../assets/imgs/share.png",
    },
    {
      title: this.global.getTranslatedJSON('TitreIntro3'),
      description: this.global.getTranslatedJSON('Intro3'),
      image: "../../assets/imgs/parameters.png",
    }
  ];

  constructor(public navCtrl: NavController, public navParams: NavParams, public translate: TranslateService, public global:GlobalProvider) {
  }

  goToHome(){
    this.navCtrl.setRoot(HomePage).then();
  }

}
