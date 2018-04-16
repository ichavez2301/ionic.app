import { Injectable } from '@angular/core';
import { Customer, CustomerProvider } from '../customer/customer';
import { AngularFirestore } from 'angularfire2/firestore';
import moment from 'moment'
import { OrderProvider } from '../order/order';

export class Payment {
  id?: number
  amount: number
  cid: number
  customer: Customer
  date: string
  eid: string
  oid: number
  return: boolean
}
@Injectable()
export class PaymentProvider {

  constructor(
    private db: AngularFirestore, 
    private orderProvider: OrderProvider,
    private customerProvider: CustomerProvider
  ) {}
  private key = "payments"
  
  public async create(payment: Payment) {
    let id = await this.autoincrement()
    payment.id = parseInt(id.toString())

    /* Agregar fecha de la ultima transaccion al cliente*/
    this.customerProvider.find(payment.cid).ref.get()
    .then((res) => {
      let customer = res.data()
      let curcustomer = CustomerProvider.convert(customer)
      curcustomer.lastvisit = new Date()

      this.customerProvider.update(curcustomer, payment.cid)
    })
    /** END */

    /** Agregar fecha del ultimo pago de la orden */
    this.orderProvider.find(payment.oid).ref.get()
    .then((res) => {
      let order = res.data()
      let curOrder = OrderProvider.convert(order)
      curOrder.lastpayment = new Date()
      
      this.orderProvider.update(curOrder, payment.oid)
    })
    /** END */

    return this.db.collection(this.key).doc(id.toString()).set(this.toArray(payment))
  }

  public async autoincrement() : Promise<Number>  {
    let docChanges = await this.db.collection(this.key).ref.orderBy("id", "desc").limit(1).get()
    let ai: Number = 1
    if(docChanges.docs.length > 0)
      ai = parseInt(docChanges.docs[0].id) + 1
    return ai
  }

  public SoldToday() {
    return this.db.collection(this.key).ref.where("date", ">=", moment().format("Y-MM-DD 00:00")).where("date", "<=", moment().format("Y-MM-DD 23:59")).get()
  }

  public toArray(payment: Payment) {
    return JSON.parse(JSON.stringify(payment))
  }
}
