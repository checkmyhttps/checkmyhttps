import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Platform, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { TranslateService } from '@ngx-translate/core';

import { HomePage } from './pages/home/home';
import { IntroPage } from './pages/intro/intro';
import { GlobalProvider } from './providers/global/global';
import { EventsService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  //Init storage
  async ngOnInit() {
    await this.storage.create();
  }

  //TODO
  //@ViewChild(Nav) nav: Nav;

  rootPage: any;
  lang:any;

  theme: any; //keep default theme

  pages: Array<{title: string, url: any}>;

  version: any;
  
  currentPageTitle = 'Home';

  constructor(public platform: Platform, public translate: TranslateService, private storage: Storage, public global: GlobalProvider, private navCtrl: NavController, private router: Router, private events: EventsService) {
    this.ngOnInit()
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

    this.version = "1.2";

    this.events.getObservable().subscribe(() => {
      this.toggleTheme();
    })

    this.loadMenu();

  }


  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

      SplashScreen.hide();
      //TODO
      this.storage.get('introShown').then((result) =>{
        if(result){
          this.rootPage = HomePage;
        } else{
          this.rootPage = IntroPage;
          this.storage.set("introShown", true);
        }
      });

      this.getTheme();
      if (Capacitor.isPluginAvailable('StatusBar')) { 
        StatusBar.setStyle({ style: Style.Light });
      }

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
      { title: homeTitle, url: '/HomePage' },
      { title: introTitle, url: '/IntroPage' },
      { title: howTitle, url: '/HowPage' },
      { title: aboutTitle, url: '/AboutPage' },
      { title: settingsTitle, url: '/SettingsPage' }
    ];
  }

  setTheme(appliedTheme){
    document.body.classList.toggle('dark', appliedTheme === 'dark-theme')
    this.theme = appliedTheme;
    this.storage.set("theme", appliedTheme);
    this.global.setToggle(this.theme);
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
