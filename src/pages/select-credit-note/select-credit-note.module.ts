import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectCreditNotePage } from './select-credit-note';

@NgModule({
  declarations: [
    SelectCreditNotePage,
  ],
  imports: [
    IonicPageModule.forChild(SelectCreditNotePage),
  ],
})
export class SelectCreditNotePageModule {}
