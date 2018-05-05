import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreCollection } from "angularfire2/firestore";
import 'rxjs/add/operator/map'
import { Observable } from 'rxjs/Observable';
import { Product } from '../../providers/products/products';


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

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, private afs: AngularFirestore) {
    this.customer = this.navParams.get("customer")
    this.order    = this.navParams.get("order")

    if(this.order != null) {
      this.products = this.order.products
    } else {
      this.isCollection = true
      this.productCollection = this.afs.collection("products")      
      this.products = this.productCollection.valueChanges()
    }
  }
  
  itemSelected(product) {
    if(this.isCollection)
      product.price = product.price - this.customer.discount
    else 
      product.price = product.price
      
    this.viewCtrl.dismiss(product)
  }

  dismiss() {
    this.viewCtrl.dismiss(null)
  }
  _parseFloat(val) {
    return parseFloat(val)
  }

}
