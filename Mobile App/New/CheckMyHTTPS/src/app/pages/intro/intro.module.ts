import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { IntroPage } from './intro';

const routes: Routes = [
  {
    path: '',
    component: IntroPage,
    outlet: 'intro'
  }
];

@NgModule({
  declarations: [IntroPage],
  entryComponents: [IntroPage],
  imports: [IonicModule, RouterModule.forChild(routes)],
})
export class IntroPageModule {}
