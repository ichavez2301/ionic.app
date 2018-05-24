import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddStockPage } from './add-stock';

@NgModule({
  declarations: [
    AddStockPage,
  ],
  imports: [
    IonicPageModule.forChild(AddStockPage),
  ],
})
export class AddStockPageModule {}
