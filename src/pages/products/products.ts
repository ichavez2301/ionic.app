import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreCollection } from "angularfire2/firestore";
import 'rxjs/add/operator/map'
import { Observable } from 'rxjs/Observable';
import { Product } from '../../providers/products/products';
import { AngularFireAuth } from 'angularfire2/auth';
import { StockProvider } from '../../providers/stock/stock';


// import { FirebaseProvider } from '../../providers/firebase/firebase'
/**
 * Generated class for the ProductsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-products',
  templateUrl: 'products.html',
})
export class ProductsPage { 
  productCollection: AngularFirestoreCollection<Product>
  products: Observable<Product[]>;
  customer: any;
  order: any;
  isCollection: boolean = false;

  constructor(
    public navCtrl: NavController,
    private stock: StockProvider,
    public navParams: NavParams, 
    public viewCtrl: ViewController, 
    private afs: AngularFirestore,
    private afa: AngularFireAuth) {
    this.customer = this.navParams.get("customer")
    this.order    = this.navParams.get("order")

    //mostrar solo productos que tengo en stock
    this.stock.today(this.afa.auth.currentUser.uid).get()
    .then((res: any) => {
      if(res.docChanges.length > 0) {
        //todo bien
        this.products = res.docChanges[0].doc.data().products;
      } else {
        //no hay mercancias por vender. agregue mercancias
      }
    })
  }
  
  itemSelected(product) {
    if(parseInt(product.qty) > 0) {
      if(this.isCollection)
        product.price = product.price - this.customer.discount
      else 
        product.price = product.price
        
      this.viewCtrl.dismiss(product)
    } else {
      alert("No cuenta con stock de este producto.");
    }
  }

  dismiss() {
    this.viewCtrl.dismiss(null)
  }
  _parseFloat(val) {
    return parseFloat(val)
  }

}
