import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, LoadingController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable'
import moment from 'moment'

import { Expense as LocalExpense } from '../../classes/structs'
import { SessionProvider } from '../../providers/session/session';

interface Expense {
  id: number,
  amount: number,
  description: string,
  eid: string,
  date: string,
  time: string
}

@IonicPage()
@Component({
  selector: 'page-expenses',
  templateUrl: 'expenses.html',
})
export class ExpensesPage  {
  public expenses: Observable<Expense[]>;
 
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public viewCtrl: ViewController, 
    private loadingCtrl: LoadingController,

    public expense: LocalExpense,
    public session: SessionProvider) 
  {
    
  }

  doSave() {
    if(this.expense.description != "" && this.expense.amount > 0) {
      
      const loader = this.loadingCtrl.create({
        content: "Espere porfavor...",
        duration: 3000
      });

      loader.present();
      this.expense.eid = this.session.CurrentUser.uid
      this.expense.date = moment().format("Y-MM-DD")
      this.expense.time = moment().format("hh:mm:ss")
      
      this.expense.save()
      .then(() => {
        loader.dismiss()
        this.viewCtrl.dismiss(this.expense);
      })

    } else {
      alert("Hay errores en el formulario, revise e intente de nuevo.")
    }
  }
}
