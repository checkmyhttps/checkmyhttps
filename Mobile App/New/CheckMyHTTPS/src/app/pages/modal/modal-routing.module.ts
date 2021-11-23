import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModalPage } from './modal';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: ModalPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule, TranslateModule]
})
export class ModalPageRoutingModule {}
