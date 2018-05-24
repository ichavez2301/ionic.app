import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';

/*
  Generated class for the ProductsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
export class Product {
  public id?: Number;
  public name: String;
  public category: String;
  public price: number;
  public qty: number = 0;
}

@Injectable()
export class ProductsProvider {

  constructor(private db: AngularFirestore) {}
  public key = "products";

  all() {
    return this.db.collection(this.key)
  }
}
