import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ModalPage } from './modal';

const routes: Routes = [
  {
    path: '',
    component: ModalPage,
    outlet: 'modal'
  }
];

@NgModule({
  declarations: [ModalPage],
  entryComponents: [ModalPage],
  imports: [IonicModule, RouterModule.forChild(routes)],
})

export class ModalPageModule {}