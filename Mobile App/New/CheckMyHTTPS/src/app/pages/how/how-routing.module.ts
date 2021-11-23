import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HowPage } from './how';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: HowPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule, TranslateModule]
})
export class HowPageRoutingModule {}
