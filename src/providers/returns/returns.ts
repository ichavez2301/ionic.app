import { Injectable } from '@angular/core';
import { Customer } from '../customer/customer';
import { AngularFirestore } from 'angularfire2/firestore';

export interface Return {
  id?: number
  pid: number,
  category: string
  cid: number
  customer: Customer
  date: string
  name: string
  price: number
  qty: number
  qtySold: number
  sales: number
}
@Injectable()
export class ReturnsProvider {

  constructor(private db: AngularFirestore) { }
  private key = "productsReturns"

  public async create(_return: Return) {
    _return.pid = _return.id
    let id = await this.autoincrement()
    _return.id = parseInt(id.toString())
    return this.db.collection(this.key).add(Object.assign({}, _return))
  }

  public async autoincrement() : Promise<Number>  {
    let docChanges = await this.db.collection(this.key).ref.orderBy("id", "desc").limit(1).get()
    let ai: Number = 1
    if(docChanges.docs.length > 0)
      ai = parseInt(docChanges.docs[0].id) + 1
    return ai
  }

  public toArray(_return: Return) {
    return JSON.parse(JSON.stringify(_return))
  }
}
