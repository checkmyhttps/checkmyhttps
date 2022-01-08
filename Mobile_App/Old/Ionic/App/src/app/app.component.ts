import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { AboutPage } from '../pages/about/about';
import { HowPage } from '../pages/how/how';
import { SettingsPage } from '../pages/settings/settings';
import { IntroPage } from "../pages/intro/intro";

import { TranslateService } from '@ngx-translate/core';

import { Storage } from '@ionic/storage';

import {GlobalProvider} from '../providers/global/global';



@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any;
  lang:any;

  theme: any = this.storage.get('theme'); //keep default theme

  pages: Array<{title: string, component: any}>;

  version: any;
  

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, private translate: TranslateService, private storage: Storage, public global: GlobalProvider, public event: Events) {
    this.initializeApp();

    this.lang = window.navigator.language;

    const lang = this.lang;
    if (lang.match(/fr/)){
      this.lang = 'fr';
    }
    else{
      this.lang = 'en';
    }

    this.translate.setDefaultLang(this.lang);
    this.translate.use(this.lang);

    this.version = "1.1.6";

    this.event.subscribe('theme:toogle', () => {
      this.toggleTheme();
    })

    this.loadMenu();

  }


  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

      this.splashScreen.hide();

      this.storage.get('introShown').then((result) =>{
        if(result){
          this.rootPage = HomePage;
        } else{
          this.rootPage = IntroPage;
          this.storage.set("introShown", true);
        }
      });

      this.getTheme();
      this.statusBar.styleLightContent();

    });
  }

  
  async loadMenu(){
    let homeTitle:any, introTitle:any, howTitle:any, aboutTitle:any, settingsTitle:any; 

    homeTitle = await this.global.getTranslation('home');
    introTitle = await this.global.getTranslation('TitreIntro1');
    howTitle = await this.global.getTranslation('how');
    aboutTitle = await this.global.getTranslation('about');
    settingsTitle = await this.global.getTranslation('settings');

    // used for an example of ngFor and navigation
    this.pages = [
      { title: homeTitle, component: HomePage },
      { title: introTitle, component: IntroPage },
      { title: howTitle, component: HowPage },
      { title: aboutTitle, component: AboutPage },
      { title: settingsTitle, component: SettingsPage }
    ];
  }
  
  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }


  setTheme(appliedTheme){
    this.theme = appliedTheme;
    this.storage.set("theme", appliedTheme);
    this.global.setToogle(this.theme);
  }


  getTheme(){
    this.storage.get('theme').then((result) =>{
      this.storage.set("theme", result);
      if(result === 'dark-theme'){
        this.setTheme('dark-theme');
      }
      else{
        this.setTheme("light-theme");
      } 
    });
  }


  toggleTheme() {
    this.storage.get('theme').then((result) =>{
      if(result === 'dark-theme'){
        this.setTheme('light-theme');
      }
      else{
        this.setTheme('dark-theme');
      }
    });
  }

}
