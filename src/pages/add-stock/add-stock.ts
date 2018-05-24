import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ProductsProvider } from '../../providers/products/products';
import { Observable } from 'rxjs/Observable';
import { StockProvider, Stock } from '../../providers/stock/stock';
import { HomePage } from '../home/home';
import { AngularFireAuth } from 'angularfire2/auth';
import * as moment from 'moment'
/**
 * Generated class for the AddStockPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-add-stock',
  templateUrl: 'add-stock.html',
})
export class AddStockPage implements OnInit {
  public disabledButton: Boolean = false;

  constructor(
    public afa: AngularFireAuth,
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private stockService: StockProvider,
    private productService: ProductsProvider) {  }

  public form: Stock = new Stock();
  public products: Observable<any[]>;

  ngOnInit() {
    this.productService.all().ref.get()
    .then((res) => {
      if(res.docChanges.length > 0) {
        res.docChanges.forEach((item: any) => {
          let product = item.doc.data()
          product.qty = 0
          this.form.products.push(product)
        })
      }
    })
  }

  sendStock() {
    this.disabledButton = true
    this.form.eid = this.afa.auth.currentUser.uid
    this.form.date = moment().format("Y-MM-DD")

    this.stockService.create(this.form)
    .then((res) => {
      this.disabledButton = false
      this.navCtrl.setRoot(HomePage)
    })
  }

}
