import { AngularFirestore } from "angularfire2/firestore";
import { Injectable } from "@angular/core";
import * as moment from "moment";

export function FirebaseHelperReturn(response: Promise<any>) {
  return new Promise((resolve, reject) => {
    response.then((res) => {
      if(res.empty) {
        resolve([])
      } else {
        let result = [];
        res.docChanges.forEach((doc: any) => {
          result.push(doc.doc.data())
        });

        resolve(result)
      }
    })
    .catch((err) => { reject(err) })
  })
}


export enum ProductCategory {
  WaterFlavor = "water_flavor",
  Water = "water"
}

@Injectable()
export class Product {
  id?: number;
  category: ProductCategory;
  name: string;
  price: number;
  stock: number; // este valor se usaria para la produccion de productos
  
  constructor() {
      //this.index = "products";
  }

  protected find(size:number = 20, offset: number = 0) {
      //return this.db.collection(this.index)
  }
}

export class ProductOrderList {
  id: number;
  product: Product = new Product();
  employeeStock: number;
  eid: string; //hash session
}

export class Route {
  id: number;
  name: string;
}

@Injectable()
export class Customer {
  id?: number;
  company: string;
  companyIndex: string; // se usa para la busqueda parcial
  address: string;
  contact: string;
  email: string;
  phone: string;
  rid: number;
  balance: number; //saldo real del cliente
  limit_credit: number; //limite de compra del cliente
  discount: number; //si quiero dar precio preferencial a un cliente en especifico

  constructor(private db?: AngularFirestore) {}

  public find() {
    return this.db.collection("customers").ref.get();
  }
}

export enum OrderType {
  Credit = 'credito',
  Counted = 'contado'
}

export class Order {
  id?: number;
  customer: Customer = new Customer();
  date: string; // fecha de la compra (yyyy-mm-dd)
  eid: string; //hash del usuario que realizo la venta
  folio: string; //folio que se agrega manual (nota de credito)
  lastpayment: string; //fecha del ultimo pago (en caso de ser nota de credito)
  amount: number; //total de la orden
  balance: number; //saldo real de la orden
  total: number = 0; //total de la orden
  products: Product[];
  orderType: OrderType = OrderType.Counted;
}

export enum EmployeeStatus {
  Active = 'active',
  Inactive = 'inactive'
}

@Injectable()
export class Employee {
  id?: number;
  rid: number;
  firstname: string;
  lastname: string;
  email?: string;
  phone?: string;
  status: EmployeeStatus;
  uid: string; //hash de session
  stock: Stock;
  /** BI totales para evitar calcular grandes cantidades de informacion */
  paymentDate: string; //fecha del ultimo pago (Y-M-D)
  paymentsToday: number; //cantidad que le han pagado segun paymentDate
  saleDay: string; //fecha de la ultima venta (Y-M-D)
  salesToday: number; //cantidad($) que ha vendido segun saleDay

  constructor(private db?: AngularFirestore) {}

  public async setByIUD(uid: string) {
    return new Promise((resolve, reject) => {
      this.db.collection("employees")
      .ref.where("uid", "==", uid)
      .get()
      .then((res) => {
        let EmployeeResult = res.docChanges[0].doc.data();
        this.id = EmployeeResult.id;
        this.firstname = EmployeeResult.firstname;
        this.lastname = EmployeeResult.lastname;
        this.email = EmployeeResult.email;
        this.status = EmployeeResult.status;
        this.uid = EmployeeResult.uid;
        this.rid = EmployeeResult.rid;
        resolve(this)
      })
      .catch((err) => {
        reject(err)
      })
    })
  }

  public async hasStockToday() {
    return new Promise((resolve, reject) => {
      this.db.collection("stock").ref
      .where("eid", "==", this.uid)
      .where("date", "==", moment().format("Y-M-D"))
      .get()
      .then((res: any) => {
        if(!res.empty) {
          this.stock = res.docChanges[0].doc.data();
          resolve(true);
        } else {
          resolve(false)
        }
      })
      .catch((err) => { reject(err) })
    })
  }

  getMyCustomerList() { // implementar paginador
    let promise = this.db.collection("customers").ref
      .orderBy("company")
      .where("rid", "==", this.rid).get()

    return FirebaseHelperReturn(promise);
  }

  update() {
    let data = Object.assign({}, this);
    delete data.db;

    return this.db.collection("employees")
      .doc(this.id.toString())
      .update(data)
  }
}

export class Expense { //Gasto
    id?: number;
    description: string;
    date: string; //fecha de registro yyyy-mm-dd
    employee: Employee = new Employee();
    time: string; //hora del registro (hh:mm:ss)
}

export class Payment {
    id?: number;
    amount: number; //cantidad que se pago
    customer: Customer = new Customer();
    date: string; //fecha de pago (yyyy-mm-dd hh:ii:ss)
    eid: string; //hash de usuario en sesion
    folio: number; //numero de folio de nota de credito
    oid: number; //id de la orden
    return: boolean; //proviene de una entrega de merma?
}

export class ProductSale extends Product {
    customer_id: number;
    order_id: number;
    qty: number;
}

export class Repayment { // Orden de merma
    id?: number;
    cid: number;
    date: string; // yyyy-mm-dd
    eid: string; //hash session
    oid: number;
    pqty: number; //cantidad de productos regresados
    total: number; //cantidad de efectivo regresado
}

export class ProductReturn extends Product {
    rpid: number; //id de la orden de mermas
    customer: Customer = new Customer();
    date: string; //(yyyy-mm-dd)
    eid: string; //hash de sesion
    qty: number; // cuanto regresaste
    qtySold: number; // cuanto se vendio  (qtySold no puede ser mayor que qty)

    public add() {
        if(this.qtySold <= this.qty) {
            //ok
        } 
        else {
            //hay un error
        }
    }
}

export class Stock { // Stock de empleado (cuanto se llevo)
  date: string; //fecha de registro en stock
  eid: string;
  products: Product[];
}