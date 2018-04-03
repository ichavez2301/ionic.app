import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable'
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore'
import { AngularFireAuth } from 'angularfire2/auth'
import { ExpensesPage } from '../expenses/expenses'
import moment from 'moment'

/**
 * Generated class for the ExpensesListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
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
  public expensesCollection: AngularFirestoreCollection<Expense>;
  public expenses: Observable<Expense[]>;

  public form: Expense = {
    id:"",
    description:"",
    amount: 0,
    eid: "",
    date: "",
    time: ""
  };

  public total: number = 0;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public afs: AngularFirestore, 
    public afa: AngularFireAuth,
    public modalCtrl: ModalController) {
  }

  ngOnInit() {
    let uid = this.afa.auth.currentUser.uid
    this.expensesCollection = this.afs.collection("expenses", ref => ref.where("date", "==", moment().format("Y-MM-DD")).where("eid", "==", uid))
    this.expenses = this.expensesCollection.valueChanges()
    this.UpdateTotal()
  }

  addExpense() {
    let modalExpense = this.modalCtrl.create(ExpensesPage)
    modalExpense.present();
  }

  UpdateTotal() {
    this.expenses.forEach((expense: Expense[]) => {
      this.total = 0
      expense.forEach((exp: Expense) => {
        this.total += parseFloat(exp.amount.toString())
      })
    })
  }

}
