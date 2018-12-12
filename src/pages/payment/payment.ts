import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { HomePage } from '../home/home'
import moment from 'moment'
import { PaymentProvider } from '../../providers/payment/payment';
import { CustomerProvider } from '../../providers/customer/customer';
import { OrderProvider } from '../../providers/order/order';
import { Payment, Order } from '../../classes/structs';
import { SessionProvider } from '../../providers/session/session';

@IonicPage()
@Component({
  selector: 'page-payment',
  templateUrl: 'payment.html',
})
export class PaymentPage {
  public order: Order;
  
  public currentOrder:any;
  public customer:any;
  public typeOrder: string = "";
  public disabled: Boolean = false;
  constructor(
    public paymentProvider: PaymentProvider,
    public customerProvider: CustomerProvider,
    public orderProvider: OrderProvider,
    public navCtrl: NavController, 
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    
    public payment: Payment,
    public session: SessionProvider) {
    
      this.order        = this.navParams.data.order;
      this.customer     = this.navParams.data.customer
      this.currentOrder = this.navParams.data.order
      this.typeOrder    = this.navParams.data.orderType
  }

  public doPayment() {
    if(this.payment.amount > 0) {
      //crear registro de pago
      this.payment.cid = this.customer.id
      this.payment.customer = this.customer
      this.payment.date = moment().format("Y-MM-DD hh:mm:ss")
      this.payment.eid = this.session.CurrentUser.uid
      this.payment.oid = this.order.id
      let loading = this.loadingCtrl.create({content: "Guardando pago, espere porfavor"})
      loading.present()

      if(!this.disabled) {
        this.disabled = true
        this.payment.create().then(() => {
          loading.dismiss()
          this.disabled = false;
          this.navCtrl.setRoot(HomePage)
        })
      }

    } else {
      alert("Ingrese una cantidad mayor a cero");
    }
  }
}
