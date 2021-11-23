import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { HowPage } from './how';

const routes: Routes = [
  {
    path: '',
    component: HowPage,
    outlet: 'how'
  }
];

@NgModule({
  declarations: [HowPage],
  entryComponents: [HowPage],
  imports: [IonicModule, RouterModule.forChild(routes)],
})
export class HowPageModule {}
