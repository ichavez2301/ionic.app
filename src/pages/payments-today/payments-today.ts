import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { PaymentProvider, Payment } from "../../providers/payment/payment";
import * as _ from 'lodash'
import { AngularFireAuth } from 'angularfire2/auth';

/**
 * Generated class for the PaymentsTodayPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-payments-today',
  templateUrl: 'payments-today.html',
})
export class PaymentsTodayPage implements OnInit {
  public payments;
  public total: number = 0;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private afa: AngularFireAuth,
    private paymentProvider: PaymentProvider) {
  }

  ngOnInit() {
    let payments: Array<any> = [];
    let uid = this.afa.auth.currentUser.uid;
    this.paymentProvider.SoldToday(uid)
    .then((res) => {
      res.docChanges.forEach((change) => {
        let payment = change.doc.data()
        payments.push(payment)
      })
      
      this.payments = _.orderBy(payments, ['id'], ['desc'])      
      this.UpdateTotal()
    })
  }

  UpdateTotal() {
    this.total = 0
    if(this.payments) {
      this.payments.forEach((pay: Payment) => {
        //paymentdoc.forEach((pay: Payment) => {
          this.total += parseFloat(pay.amount.toString())
        //})
      })
    }
  }
}
