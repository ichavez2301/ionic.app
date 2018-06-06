import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-create-order',
  templateUrl: 'create-order.html',
})
export class CreateOrderPage {
  public form: any;

  constructor(
    public navCtrl: NavController, 
    public viewCtrl: ViewController,
    public navParams: NavParams) {
    this.form = this.navParams.data
    if(this.form.data.orderType == 'contado')
      this.form.data.amount = this.form.data.total
    else 
      this.form.data.amount = 0
  }

  dismiss() {
    this.viewCtrl.dismiss()
  }

  ok() {
    this.viewCtrl.dismiss(this.form.data)
  }

}
