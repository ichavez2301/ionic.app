import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Order } from '../../classes/structs';

/**
 * Generated class for the SelectCreditNotePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-select-credit-note',
  templateUrl: 'select-credit-note.html',
})
export class SelectCreditNotePage {

  public notesCredit: Order[] = [];

  constructor(
    public navCtrl: NavController, 
    public orders: Order,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    let cid = this.navParams.get("cid")
    this.orders.noteCreditsByClient(cid)
    .then((res: any) => {
      console.log(res)
      this.notesCredit = res
    })
  }

}
