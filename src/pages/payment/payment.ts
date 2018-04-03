import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestore } from 'angularfire2/firestore'
import { AngularFireAuth } from 'angularfire2/auth'
import { HomePage } from '../home/home'
import moment from 'moment'
/**
 * Generated class for the PaymentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-payment',
  templateUrl: 'payment.html',
})
export class PaymentPage {

  public form = {
    orderId: 0,
    balance: 0,
    amount: 0,
    result: 0
  }
  public currentOrder:any;

  public customer:any;
  constructor(public navCtrl: NavController, public navParams: NavParams, private afs: AngularFirestore, private afa: AngularFireAuth) {
    this.form.balance = this.navParams.data.order.balance
    this.form.orderId = this.navParams.data.order.id
    this.customer     = this.navParams.data.customer
    this.currentOrder = this.navParams.data.order
  }

  public doPayment() {
    if(this.form.amount > 0) {
      //crear registro de pago
      this.afs.collection("payments").add({
        amount: this.form.amount,
        cid: this.customer.id,
        customer: this.customer,
        date: moment().format("Y-MM-DD hh:mm:ss"),
        eid: this.afa.auth.currentUser.uid,
        oid: this.form.orderId,
        return: false
      })

      //actualizar el balance del cliente
      this.customer.balance = parseFloat(this.customer.balance) - parseFloat(this.form.amount.toString())
      this.afs.collection("customers")
        .doc(this.customer.id.toString())
        .set(this.customer)

      this.currentOrder.balance = parseFloat(this.currentOrder.balance.toString()) - parseFloat(this.form.amount.toString())
      
      this.afs.collection("orders").doc(this.currentOrder.id.toString())
        .set(this.currentOrder)      

      //actualizar los pagos del dia del empleado
      this.afs.collection("employees", ref => ref.where("uid", "==", this.afa.auth.currentUser.uid))
      .ref.get()
      .then((res) => {
        if(res.docChanges.length > 0) {
          let currentEmployee = res.docChanges[0].doc.data()
          if(moment().format("YYYY-MM-DD") == currentEmployee.paymentDate) {
            let curr_paymentToday = parseFloat(currentEmployee.paymentsToday)
            let curr_amount = parseFloat(this.form.amount.toString())
            
            currentEmployee.paymentsToday =  curr_paymentToday + curr_amount
          } else
            currentEmployee.paymentsToday = this.form.amount
          
          currentEmployee.paymentDate = moment().format("YYYY-MM-DD")
          this.afs.collection("employees").doc(res.docChanges[0].doc.id)
            .set(currentEmployee)
        }
      })

      this.navCtrl.setRoot(HomePage)
    } else {
      alert("Ingrese una cantidad mayor a cero");
    }
  }
}
