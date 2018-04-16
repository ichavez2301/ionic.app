import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';

export class Customer {
  id?: number
  address: string 
  balance: number
  company: string
  contact: string
  eid: number
  email: string
  limit_credit: number
  more_price: number
  phone: string
  postal_code: string
  lastvisit?: Date | null
}
@Injectable()
export class CustomerProvider {

  constructor(private db: AngularFirestore) { }
  public key = "customers"

  public async create(customer) {
    let id = await this.autoincrement()
    customer.id = parseInt(id.toString())
    return this.db.collection(this.key).doc(id.toString()).set(this.toArray(customer))
  }

  public update(customer: Customer, id: number) {
    return this.db.collection(this.key).doc(id.toString()).set(this.toArray(customer))
  }

  public static convert(customer: any): Customer {
    let newcustomer: Customer = new Customer();

    newcustomer.id            = customer.id
    newcustomer.address       = customer.address
    newcustomer.balance       = customer.balance
    newcustomer.company       = customer.company
    newcustomer.contact       = customer.contact
    newcustomer.eid           = customer.eid
    newcustomer.email         = customer.email
    newcustomer.limit_credit  = customer.limit_credit
    newcustomer.more_price    = customer.more_price
    newcustomer.phone         = customer.phone
    newcustomer.postal_code   = customer.postal_code
    newcustomer.lastvisit     = customer.lastvisit

    return newcustomer
  }

  public find(id: number) {
    return this.db.collection(this.key).doc(id.toString())
  }

  public async autoincrement() : Promise<Number>  {
    let docChanges = await this.db.collection(this.key).ref.orderBy("id", "desc").limit(1).get()
    let ai: Number = 1
    if(docChanges.docs.length > 0)
      ai = parseInt(docChanges.docs[0].id) + 1
    return ai
  }

  public toArray(customer: Customer) {
    return JSON.parse(JSON.stringify(customer))
  }
}
