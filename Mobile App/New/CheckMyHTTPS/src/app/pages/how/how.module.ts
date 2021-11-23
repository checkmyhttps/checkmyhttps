import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HowPage } from './how';

import { HowPageRoutingModule } from './how-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HowPageRoutingModule
  ],
  declarations: [HowPage]
})
export class HowPageModule {}
