import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { AboutPage } from '../pages/about/about';
import { HowPage } from '../pages/how/how';
import { SettingsPage } from '../pages/settings/settings';
import { IntroPage } from '../pages/intro/intro';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

// // Multi-language App
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

//HTTP
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HTTP } from '@ionic-native/http';

//ImageViewer
import { IonicImageViewerModule } from 'ionic-img-viewer';
import { GlobalProvider } from '../providers/global/global';

//SQLite
import { IonicStorageModule } from '@ionic/storage';

//Keyboard
import { Keyboard } from '@ionic-native/keyboard';

//Translate Loader
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    AboutPage,
    HowPage,
    SettingsPage,
    IntroPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpClientModule,
    IonicImageViewerModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    IonicStorageModule.forRoot(),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    AboutPage,
    HowPage,
    SettingsPage,
    IntroPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    HTTP,
    HttpClient,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    GlobalProvider,
    Keyboard
  ]
})
export class AppModule {}
