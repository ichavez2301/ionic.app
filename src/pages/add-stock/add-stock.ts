import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { ProductsProvider } from '../../providers/products/products';
import * as moment from 'moment'
import { SessionProvider } from '../../providers/session/session';
import { Employee, Stock, ProductInStock } from '../../classes/structs';
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
    public navCtrl: NavController, 
    public navParams: NavParams,
    public viewCtrl: ViewController,

    public employee: Employee,
    public session: SessionProvider,
    private productService: ProductsProvider) {  }

  public form: Stock = new Stock();

  ngOnInit() {
    this.productService.all().ref.get()
    .then((res) => {
      if(res.docChanges.length > 0) {
        res.docChanges.forEach((item: any) => {
          let product: ProductInStock = item.doc.data()
          product.qty = 0
          this.form.products.push(product)
        })
      }
    })
  }

  sendStock() {
    this.disabledButton = true
    this.form.eid = this.session.CurrentUser.uid
    this.form.date = moment().format("Y-MM-DD")
    
    let stock = Object.assign({}, this.form)
    
    this.employee.addStock(stock)
    .then(() => {
      this.disabledButton = false
      this.viewCtrl.dismiss();
    })

    // this.stockService.create(this.form)
    // .then((res) => {
    //   this.disabledButton = false
    //   this.navCtrl.setRoot(HomePage)
    // })
  }

}
