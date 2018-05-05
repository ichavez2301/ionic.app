import { Component, OnInit } from '@angular/core'
import { IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular'
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore'
import { Observable } from 'rxjs/Observable'
import { PaymentPage } from '../payment/payment'
import { LossesPage } from '../losses/losses'
/**
 * Generated class for the CreditsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

interface Order {
  amount: string,
  balance: number,
  cid: number,
  customer: number,
  date: string, //date
  eid: string,
  id: number,
  orderType: string,
  products: any,
  total: number
}

@IonicPage()
@Component({
  selector: 'page-credits',
  templateUrl: 'credits.html',
})
export class CreditsPage implements OnInit {
  public OrderCollection: AngularFirestoreCollection<Order>;
  public Orders: Observable<Order[]>;

  public Customer: any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public as: ActionSheetController,
    private afs: AngularFirestore) {

      this.Customer = this.navParams.data;
  }

  ngOnInit() {
    this.OrderCollection = this.afs.collection("orders", ref => ref.where("orderType", "==", "credito").where("balance", ">", 0).where("cid", "==", this.Customer.id))
    this.Orders = this.OrderCollection.valueChanges()
  }

  asheet(order) {
    let actionSheet = this.as.create({
      title: 'Opciones',
      buttons: [{
        icon: 'card',
        text: 'Abonar',
        handler: () => {
          this.navCtrl.push(PaymentPage, { customer: this.Customer, order: order })
        }
      },{
        icon: 'card',
        text: 'Registrar mermas',
        handler: () => {
          this.navCtrl.push(LossesPage, { customer: this.Customer, order: order })
        }
      },{
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
