import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IntroPage } from './intro';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: IntroPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule, TranslateModule]
})
export class IntroPageRoutingModule {}
