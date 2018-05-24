import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Product } from '../products/products';


export class Stock {
  products: Product[] = []
  date: string
  eid: string
}
@Injectable()
export class StockProvider {

  constructor(private db: AngularFirestore) {}
  public key = "stock";

  ref() {
    return this.db.collection(this.key).ref
  }

  create(data: Stock) {
    return this.db.collection(this.key).add(Object.assign({}, data))
  }

}
