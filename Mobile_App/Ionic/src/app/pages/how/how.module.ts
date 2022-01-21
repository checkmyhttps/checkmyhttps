import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HowPageRoutingModule } from './how-routing.module';

import { HowPage } from './how';

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
