import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { SessionProvider } from '../../providers/session/session';
import { Employee, Stock } from '../../classes/structs';
import { AddStockPage } from '../add-stock/add-stock';

/**
 * Generated class for the StockPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-stock',
  templateUrl: 'stock.html',
})
export class StockPage implements OnInit {

  constructor(
    public session: SessionProvider,
    public employee: Employee,

    public modal: ModalController,
    public navCtrl: NavController,
    public navParams: NavParams) {
  }

  public stock: Stock = new Stock();

  async ngOnInit() {
    if(await this.session.exists()) {
      await this.employee.setByIUD(this.session.CurrentUser.uid)
      
      if(this.employee.stock) {
        this.stock = this.employee.stock
      }
    }
  }

  public addStock() {
    let modal = this.modal.create(AddStockPage)
    modal.onDidDismiss(() => {
      this.ngOnInit()
    })
    modal.present()
  }

}
