import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LossesPage } from './losses';

@NgModule({
  declarations: [
    LossesPage,
  ],
  imports: [
    IonicPageModule.forChild(LossesPage),
  ],
})
export class LossesPageModule {}
