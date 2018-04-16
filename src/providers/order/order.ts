import { Injectable } from '@angular/core';
import { Customer } from '../customer/customer';
import { AngularFirestore } from 'angularfire2/firestore';

export class Order {
  id?: number
  amount: number
  balance: number
  cid: number
  customer: Customer
  data: string
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

  public find(id: number) {
    return this.db.collection(this.key).doc(id.toString())
  }

  public update(order: Order, id: number) {
    order.lastpayment = new Date()
    return this.db.collection(this.key).doc(id.toString()).set(this.toArray(order))
  }

  public static convert(order: any) {
    let neworder: Order = new Order();

    neworder.amount     = order.amount
    neworder.balance    = order.balance
    neworder.cid        = order.cid
    neworder.customer   = order.customer
    neworder.data       = order.data
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

}
