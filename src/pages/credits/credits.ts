import { Component, OnInit } from '@angular/core'
import { IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular'
import { PaymentPage } from '../payment/payment'
import { Order, Customer } from '../../classes/structs';


@IonicPage()
@Component({
  selector: 'page-credits',
  templateUrl: 'credits.html',
})
export class CreditsPage implements OnInit {
  public customer: Customer;
  public Orders: Array<Order> = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public order: Order,
    public as: ActionSheetController) {

      this.customer = this.navParams.data;
  }

  async ngOnInit() {
    this.Orders = await this.order.findCustomerCredits(this.customer.id)
  }

  asheet(order) {
    let actionSheet = this.as.create({
      title: 'Opciones',
      buttons: [{
        icon: 'card',
        text: 'Abonar',
        handler: () => {
          this.navCtrl.push(PaymentPage, { customer: this.customer, order: order })
        }
      }, {
        icon: 'close',
        text: 'Cancelar',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });

    actionSheet.present();
  }

}
