import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { ExpensesPage } from '../expenses/expenses'

import { Expense as LocalExpense } from '../../classes/structs'
import { SessionProvider } from '../../providers/session/session';

interface Expense {
  id: string,
  description:string,
  amount: number,
  eid: string,
  date: string,
  time: string
}

@IonicPage()
@Component({
  selector: 'page-expenses-list',
  templateUrl: 'expenses-list.html',
})
export class ExpensesListPage implements OnInit {
  public expenses: Expense[] = [];
  public total: number = 0;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
   
    public expense: LocalExpense,
    public session: SessionProvider,
    public modalCtrl: ModalController) {
  }

  ngOnInit() {

    this.expense.findByUid(this.session.CurrentUser.uid)
    .then((expenses: any) => {
      this.expenses = expenses
      this.UpdateTotal()
    })
  }

  addExpense() {
    let modalExpense = this.modalCtrl.create(ExpensesPage)
    modalExpense.onDidDismiss((data) => {
      if(data) {
        this.ngOnInit()
      }
    })
    modalExpense.present();
  }

  UpdateTotal() {
    if(this.expenses.length > 0) {
      this.expenses.forEach((expense: Expense) => {
        this.total = 0
        this.total += parseFloat(expense.amount.toString())
      })
    }
  }

}
