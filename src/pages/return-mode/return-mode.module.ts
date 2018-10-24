import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReturnModePage } from './return-mode';

@NgModule({
  declarations: [
    ReturnModePage,
  ],
  imports: [
    IonicPageModule.forChild(ReturnModePage),
  ],
})
export class ReturnModePageModule {}
