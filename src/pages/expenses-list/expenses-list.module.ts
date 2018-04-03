import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ExpensesListPage } from './expenses-list';

@NgModule({
  declarations: [
    ExpensesListPage,
  ],
  imports: [
    IonicPageModule.forChild(ExpensesListPage),
  ],
})
export class ExpensesListPageModule {}
