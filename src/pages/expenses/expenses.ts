import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { AngularFirestore } from 'angularfire2/firestore'
import { AngularFireAuth } from 'angularfire2/auth'
import { Observable } from 'rxjs/Observable'
import moment from 'moment'
/**
 * Generated class for the ExpensesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
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
  //public expensesCollection: AngularFirestoreCollection<Expense>;
  public expenses: Observable<Expense[]>;

  public form: Expense = {
    id: 0,
    description: "Gasolina",
    amount: 0,
    eid: "",
    date: "",
    time: ""
  };

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public viewCtrl: ViewController, 
    private afs: AngularFirestore, 
    private afa: AngularFireAuth) 
  {
    
  }

  doSave() {
    if(this.form.description != "" && this.form.amount > 0) {
      this.afs.collection("expenses").ref.orderBy("id", "desc").limit(1)
        .get()
        .then((res) => {
          let keyId = 1          
          if(res.docChanges.length > 0) 
            keyId = parseInt(res.docChanges[0].doc.data().id) + 1

            this.form.id   = keyId
            this.form.eid  = this.afa.auth.currentUser.uid
            this.form.date = moment().format("Y-MM-DD")
            this.form.time = moment().format("hh:mm:ss")

            this.afs.collection("employees").ref.where("uid", "==", this.afa.auth.currentUser.uid).get()
            .then((res) => {
              if(res.docChanges.length > 0) {
                let currentEmployee = res.docChanges[0].doc.data()

                this.form["employee"] = currentEmployee
                this.afs.collection("expenses").doc(keyId.toString())
                .set(this.form)

                currentEmployee.paymentsToday = parseFloat(currentEmployee.paymentsToday.toString()) - parseFloat(this.form.amount.toString())
                this.afs.collection("employees").doc(res.docChanges[0].doc.id).set(currentEmployee)
              }
            })

            this.viewCtrl.dismiss(this.form);
        })
    } else {
      alert("Hay errores en el formulario, revise e intente de nuevo.")
    }
  }
}
