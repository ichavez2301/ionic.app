import { Injectable } from '@angular/core';
import { AngularFirestore } from "angularfire2/firestore";

export class Repayments {
  id?: number
  cid: string
  date: string
  eid: string
  oid: string 
  pqty: number
  total: number
}

@Injectable()
export class RepaymentsProvider {
  public key = "repayments"
  constructor(private db: AngularFirestore) { }

  public async create(repayments: Repayments) {
    let id = await this.autoincrement()
    repayments.id = parseInt(id.toString())
    return this.db.collection(this.key).doc(id.toString()).set(this.toArray(repayments))
  }

  public async autoincrement(): Promise<Number> {
    let docChanges = await this.db.collection(this.key).ref.orderBy("id", "desc").limit(1).get()
    let ai: Number = 1
    if(docChanges.docs.length > 0)
      ai = parseInt(docChanges.docs[0].id) + 1
    return ai
  }

  public toArray(repayment: Repayments) {
    return JSON.parse(JSON.stringify(repayment))
  }
}
