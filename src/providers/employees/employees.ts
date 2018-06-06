import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';

/*
  Generated class for the EmployeesProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
export class Employee {
  id?: number;
  firstname: String;
  lastname: String;
  email: String;
  paymentDate: String;
  paymentsToday: number;
  rid: number;
  phone: String;
  saleDay: String;
  salesToday: number;
  status: String;
  uid: String;
}

@Injectable()
export class EmployeesProvider {
  public key = "employees";

  constructor(private db: AngularFirestore) {
  }

  update(data: Employee, id: number) {
    return this.db.collection(this.key).doc(id.toString()).update({ rid: data.rid})
  }
  ref() {
    return this.db.collection(this.key).ref
  }

}
