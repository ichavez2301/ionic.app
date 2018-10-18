import { Injectable } from '@angular/core';
import { Customer } from '../customer/customer';
import { AngularFirestore } from 'angularfire2/firestore';

export class Order {
  id?: number
  amount: number
  balance: number
  cid: number
  folio: number
  customer: Customer
  date?: string
  eid: string
  orderType: string
  products: Array<Object>
  lastpayment?: Date
  total: number
}
@Injectable()
export class OrderProvider {

  constructor(private db: AngularFirestore) { }
  public key = "orders"
  private last_insert_id = null;

  public lastInsertId() {
    return this.last_insert_id;
  }
  public find(id: number) {
    return this.db.collection(this.key).doc(id.toString())
  }

  public async create(order: Order) {
    order.lastpayment = new Date()
    let id = await this.autoincrement()
    order.id = id
    this.last_insert_id = id
    return this.db.collection(this.key).doc(id.toString()).set(Object.assign({}, order))
  }

  public update(order: Order, id: number) {
    order.lastpayment = new Date()
    return this.db.collection(this.key).doc(id.toString()).set(Object.assign({}, order))
  }

  public static convert(order: any) {
    let neworder: Order = new Order();

    neworder.amount     = order.amount
    neworder.balance    = order.balance
    neworder.cid        = order.cid
    neworder.customer   = order.customer
    neworder.date       = order.date
    neworder.eid        = order.eid
    neworder.id         = order.id
    neworder.orderType  = order.orderType
    neworder.products   = order.products
    neworder.total      = order.total
    neworder.lastpayment= order.lastpayment

    return neworder
  }

  public toArray(order: Order) {
    return JSON.parse(JSON.stringify(order))
  }

  public async autoincrement() : Promise<number> {
    let docChanges = await this.db.collection(this.key).ref.orderBy("id", "desc").limit(1).get()
    let ai: number = 1
    if(docChanges.docs.length > 0)
      ai = parseInt(docChanges.docs[0].id) + 1
    return ai
  }

}
