import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Order, OrderType } from '../../classes/structs';

@IonicPage()
@Component({
  selector: 'page-create-order',
  templateUrl: 'create-order.html',
})
export class CreateOrderPage {
  public form: Order = new Order();

  constructor(
    public navCtrl: NavController, 
    public viewCtrl: ViewController,
    public navParams: NavParams) {
    
    this.form = this.navParams.data.data
    if(this.form.orderType == OrderType.Counted)
      this.form.amount = this.form.total
    else 
      this.form.amount = 0
  }

  dismiss() {
    this.viewCtrl.dismiss()
  }

  ok() {
    if(typeof this.form.amount == 'string')
      this.form.amount = parseFloat(this.form.amount)
    
    this.viewCtrl.dismiss(this.form)
  }

}
