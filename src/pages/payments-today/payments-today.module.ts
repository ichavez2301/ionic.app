import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PaymentsTodayPage } from './payments-today';

@NgModule({
  declarations: [
    PaymentsTodayPage,
  ],
  imports: [
    IonicPageModule.forChild(PaymentsTodayPage),
  ],
})
export class PaymentsTodayPageModule {}
