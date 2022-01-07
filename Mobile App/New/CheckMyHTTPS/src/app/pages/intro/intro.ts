import { Component } from '@angular/core';
import { NavController, NavParams } from '@ionic/angular';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { GlobalProvider } from "../../providers/global/global";


@Component({
  selector: 'page-intro',
  templateUrl: './intro.html',
  styleUrls: ['./intro.scss'],
  providers: [NavParams]
})
export class IntroPage {

  slides: Array<{title: string, description: string; image: string}>;


  constructor(public navCtrl: NavController, public navParams: NavParams, public translate: TranslateService, public global:GlobalProvider, private router: Router) {
    this.loadSlides();
  }

  goToHome(){
    this.router.navigateByUrl('/HomePage');
  }

  async loadSlides(){

    let title1:any = await this.global.getTranslation('TitreIntro1');
    let description1:any = await this.global.getTranslation('Intro1');
    let title2:any = await this.global.getTranslation('TitreIntro2');
    let description2:any = await this.global.getTranslation('Intro2');
    let title3:any = await this.global.getTranslation('TitreIntro3');
    let description3:any = await this.global.getTranslation('Intro3');

    this.slides = [
      {
        title: title1,
        description: description1,
        image: "../../assets/imgs/home.png",
      },
      {
        title: title2,
        description: description2,
        image: "../../assets/imgs/share.png",
      },
      {
        title: title3,
        description: description3,
        image: "../../assets/imgs/parameters.png",
      }
    ];
  }
}
