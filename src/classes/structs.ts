import { AngularFirestore } from "angularfire2/firestore";
import { Injectable } from "@angular/core";
import * as moment from "moment";

const env = 'production'

export function ParseJson(object) {
  let _object = Object.assign({}, object);
  if(_object.db) {
    delete _object.db;
  }
  return JSON.parse(JSON.stringify(_object))
};

export async function FirebaseHelperReturn(response: Promise<any>) {
  return new Promise((resolve, reject) => {
    response.then((res) => {
      if(res.docChanges)  {
        if(res.empty) {
          resolve([])
        } else {
          let result = [];
          res.docChanges.forEach((doc: any) => {
            result.push(doc.doc.data())
          });

          resolve(result)
        }
      } else {
        resolve(res.data())
      }
    })
    .catch((err) => { reject(err) })
  })
}

export function sumStocks(stockIn: Stock, stockNew: Stock) {
  let stockOut = ParseJson(stockIn)
  if(!stockIn.products)
    return stockNew
    
  if(stockOut.products) {
    stockOut.products.forEach((productIn) => {
      if(stockNew.products) {
        stockNew.products.forEach((productNew) => {
          if(productIn.id == productNew.id) { // si son el mismo producto
            if(typeof productNew.qty == 'string')
              productNew.qty = parseFloat(productNew.qty)
            if(typeof productIn.qty == 'string')
              productIn.qty = parseFloat(productIn.qty)

            productIn.qty += productNew.qty
          }
        })
      }
    })
  }

  return stockOut;
}

export function subStock(stockIn: Stock, stockNew: Stock) {
  let stockOut = ParseJson(stockIn)
  if(stockOut.products) {
    stockOut.products.forEach((productIn) => {
      if(stockNew.products) {
        stockNew.products.forEach((productNew) => {
          if(productIn.id == productNew.id) { // si son el mismo producto
            if(typeof productNew.qty == 'string')
              productNew.qty = parseFloat(productNew.qty)
            if(typeof productIn.qty == 'string')
              productIn.qty = parseFloat(productIn.qty)

            productIn.qty -= productNew.qty
          }
        })
      }
    })
  }

  return stockOut;
}


export async function autoincrement(db, table: string): Promise<number> {
  let docChanges = await db.collection(table).ref.orderBy("id", "desc").limit(1).get()
  let ai: number = 1
  if(docChanges.docs.length > 0)
    ai = parseInt(docChanges.docs[0].id) + 1
  return ai  
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
  //stock: number; //Este valor se usaria para la produccion de productos
  
  constructor(private db?: AngularFirestore) {}

  public async find() : Promise<any> {
    return FirebaseHelperReturn(this.db.collection("products").ref.get())
  }
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
  byorder: number = 0;

  constructor(private db?: AngularFirestore) {}

  public async findById(cid: number) {
    let promise = this.db.collection("customers").doc(cid.toString()).ref.get()
    let result: any = await FirebaseHelperReturn(promise)
    if(result) {
      this.id = result.id
      this.company = result.company
      this.companyIndex = result.companyIndex
      this.address = result.address
      this.contact = result.contact
      this.email = result.email
      this.phone = result.phone
      this.rid = result.rid
      this.balance = result.balance
      this.limit_credit = result.limit_credit
      this.discount = result.discount
      this.byorder = result.byorder
    }
  }

  public find() {
    return this.db.collection("customers").ref.get();
  }

  public update() {
    let customer = ParseJson(this)
    if(env == 'production') 
      this.db.collection("customers").doc(this.id.toString()).set(customer)
  }
}

export enum OrderType {
  Credit = 'credito',
  Counted = 'contado'
}

@Injectable()
export class Order {
  id?: number;
  cid: number;
  customer: Customer;
  date: string; // fecha de la compra (yyyy-mm-dd)
  eid: string; //hash del usuario que realizo la venta
  folio: string; //folio que se agrega manual (nota de credito)
  lastpayment: string; //fecha del ultimo pago (en caso de ser nota de credito)
  amount: number = 0; //total de la orden
  balance: number;

  //balance: number; //saldo real de la orden
  total: number = 0; //total de la orden
  products: ProductInStock[];
  orderType: OrderType = OrderType.Counted;

  constructor(private db?: AngularFirestore) {
    this.customer = new Customer(this.db);
  }

  public noteCreditsByClient(cid: number) {
    let promise = this.db.collection("orders").ref
      .where("orderType", "==", OrderType.Credit)
      .where("balance", ">", 0)
      .where("cid", "==", cid)
      .get()

      return FirebaseHelperReturn(promise)
  }

  public async findOrderById(order_id: number) {
    let promise = this.db.collection("orders").doc(order_id.toString()).ref.get()
    let result: any = await FirebaseHelperReturn(promise)
    console.log("busqueda de orden")
    console.log(result)
    if(result) {
      this.id = result.id
      this.cid  = result.customer.id
      this.customer = result.customer
      this.date = result.date
      this.eid = result.eid
      this.folio = result.folio
      this.lastpayment = result.lastpayment
      this.amount = result.amount
      this.balance = result.balance
      this.total = result.total
      this.products = result.products
      this.orderType = result.orderType
    }
  }

  public find() {}

  public async findCustomerCredits(cid: number): Promise<any> {
    let promise = this.db.collection("orders").ref
      .where("orderType", "==", OrderType.Credit)
      .where("balance", ">", 0)
      .where("cid", "==", cid)
      .get();

    return FirebaseHelperReturn(promise);
  }

  public update() {
    let data = ParseJson(this);
    delete data.db;
    console.log(this)
    return this.db.collection("orders")
      .doc(this.id.toString())
      .update(data)
  }

  public async save() {
    //registrar orden de compra
    this.id = await autoincrement(this.db, 'orders');
    let order = ParseJson(this);
    order.cid = order.customer.id
    console.log("creando orden")
    let orderResult = await this.db.collection("orders").doc(order.id.toString()).set(order)

    //actualizo el 
    let customer = new Customer(this.db);
    customer.id = this.customer.id;
    customer.company = this.customer.company
    customer.companyIndex = this.customer.companyIndex
    customer.address = this.customer.address
    customer.balance = this.customer.balance + this.total // agregamos la totalidad de factura y al complementar el pago se agrega el anticipo o liquidacion
    customer.contact = this.customer.contact
    customer.discount = this.customer.discount
    customer.email = this.customer.email
    customer.limit_credit = this.customer.limit_credit
    customer.phone = this.customer.phone
    customer.rid = this.customer.rid
    console.log("guardar saldo del cliente si pago o anticipo")
    console.log(customer)
    customer.update();

    let employee = new Employee(this.db)
    await employee.setByIUD(this.eid)
    
    if(moment().format("Y-MM-DD") == employee.saleDay) {
      employee.salesToday = employee.salesToday + this.total
    } else {
      employee.salesToday = this.total
      employee.saleDay = moment().format("Y-MM-DD")
    }
    //agregar salidas de stock
    let orderStock = new Stock();
    orderStock.products = this.products
    
    employee.stock = subStock(employee.stock, orderStock)
    console.log("se actualiza los records de venta del empleado")
    employee.update()
    
    // registrar pago
    if(order.amount > 0) {
      let payment = new Payment(this.db);
      
      payment.customer = order.customer
      payment.amount = order.amount,
      payment.oid = this.id;
      payment.eid = order.eid
      payment.cid = order.customer.id
      payment.folio = order.folio
      payment.date = moment().format("YYYY-MM-DD HH:mm")

      await payment.create();
    }

    return orderResult;
  }
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
  paymentsToday: number = 0; //cantidad que le han pagado segun paymentDate
  saleDay: string; //fecha de la ultima venta (Y-M-D)
  salesToday: number = 0; //cantidad($) que ha vendido segun saleDay

  expenses: number = 0 //total gastados ala fecha de expensesDate
  expensesDate: string; //(Y-M-D)

  returns: number = 0;
  returnsDate: string;

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
        this.paymentDate = EmployeeResult.paymentDate
        this.paymentsToday = EmployeeResult.paymentsToday
        this.salesToday = EmployeeResult.salesToday
        this.saleDay = EmployeeResult.saleDay
        this.expenses = EmployeeResult.expenses
        this.expensesDate = EmployeeResult.expensesDate
        this.stock = EmployeeResult.stock
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

  public stockIndexed() {
    let index = {};
    if(this.stock) {
      this.stock.products.forEach(product => {
        index[product.id] = product;
      });
    }

    return index;
  }

  public async hasStock() {
    let stockTotal = 0;

    return new Promise(async (resolve, reject) => {
      if(this.stock.products) {
        this.stock.products.forEach((product) => {
          stockTotal += product.qty
        })

        if(stockTotal > 0)
          resolve(true)
        else 
          resolve(false)

      } else {
        resolve(false)
      }
    })
  }

  getMyCustomerList() { // implementar paginador
    let promise = this.db.collection("customers").ref
      .where("rid", "==", this.rid).get()

    return FirebaseHelperReturn(promise);
  }

  update() {
    let data = ParseJson(this);
    
    if(env == 'production') {
      return this.db.collection("employees")
        .doc(this.id.toString())
        .update(data)
    }
  }

  async addStock(stock: Stock) {
    // agregar bitacora de stock de salida
    // agregar sumatoria a stock de empleado
    await this.db.collection("stock-outputs").add(stock)
    let mystock = sumStocks(this.stock, stock)
    this.stock = mystock
    this.update()
  }
}

@Injectable()
export class Expense { //Gasto
  id?: number;
  description: string;
  amount: number;
  date: string; //fecha de registro yyyy-mm-dd
  eid: string; //hash session
  employee: Employee = new Employee();
  time: string; //hora del registro (hh:mm:ss)

  constructor(private db?: AngularFirestore) {}

  public findByUid(uid: string) {
    let promise = this.db.collection("expenses").ref
      .where("date", "==", moment().format("Y-MM-DD"))
      .where("eid", "==", uid)
      .get()

    return FirebaseHelperReturn(promise)
  }

  public async save() {
    /**
     * 1.- guardar gasto
     * 2.- guardar gasto en empleado
     */
    if(typeof this.amount == 'string')
      this.amount = parseFloat(this.amount)


    let employee = new Employee(this.db);
    await employee.setByIUD(this.eid)

    this.employee = ParseJson(employee)
    this.id = await autoincrement(this.db, 'expenses')
    let expense = ParseJson(this)
    let result = await this.db.collection("expenses").doc(expense.id.toString()).set(expense)
    
    
    if(employee.expensesDate && moment().format("Y-M-D") == employee.expensesDate) {
      employee.expenses = employee.expenses + this.amount
    } else {
      employee.expensesDate = moment().format("Y-M-D")
      employee.expenses = this.amount
    }
    employee.update()

    return result
  }
}

@Injectable()
export class Payment {
    id?: number;
    amount: number = 0; //cantidad que se pago
    customer: Customer = new Customer();
    cid: number;
    date: string; //fecha de pago (yyyy-mm-dd hh:ii:ss)
    eid: string; //hash de usuario en sesion
    folio: string; //numero de folio de nota de credito
    oid: number; //id de la orden
    return: boolean = false; //proviene de una entrega de merma?

    constructor(private db?: AngularFirestore) {}

    public async create() {
      /** logica de negocio
       * 1.- registrar el pago
       * 2.- complemento de pago en cuenta de cliente
       * 3.- complemento de pago en cuenta de compra
       * 4.- actualizar saldos de empleado (records de venta)
       */
      if(typeof this.amount == 'string')
        this.amount = parseFloat(this.amount)
        
      this.id = await autoincrement(this.db, 'payments')
      let payment = ParseJson(this);
      delete payment.db;
      let paymentResult = this.db.collection("payments").doc(payment.id.toString()).set(payment)
      console.log("se crea el pago")

      //complementar pago(anticipo) o liquidacion en pago de contado      
      let customer = new Customer(this.db)
      await customer.findById(this.customer.id)
      customer.balance = customer.balance - this.amount
      customer.update()

      let order = new Order(this.db)
      await order.findOrderById(this.oid)
    
      order.balance = order.balance - this.amount
      order.update()

      let employee = new Employee(this.db)
      await employee.setByIUD(this.eid)
      
      if(employee.paymentDate && (moment().format("YYYY-MM-DD") == moment(employee.paymentDate).format("YYYY-MM-DD"))) {
        employee.paymentsToday = employee.paymentsToday + this.amount
      } else {
        employee.paymentsToday = this.amount
        employee.paymentDate = moment().format("YYYY-MM-DD HH:mm")
      }

      employee.update()
      
      if(env == 'production')
        return paymentResult;
      
      
    }
}

export class ProductSale extends Product {
    customer_id: number;
    order_id: number;
    qty: number;
}

export enum ReturnModeTypes {
  toAccount='to_account',
  Cash='cash',
  Goods='goods'
}

@Injectable()
export class Repayment { // Orden de merma
    id?: number;
    cid: number;
    date: string; // yyyy-mm-dd
    eid: string; //hash session
    oid: number;
    pqty: number; //cantidad de productos regresados
    total: number; //cantidad de efectivo regresado
    returnMode: ReturnModeTypes = ReturnModeTypes.Cash;
    products: ProductInStock[] = [];
    
    constructor(private db?: AngularFirestore) {}

    async onAccount(): Promise<any> {
      //registro de mermas
      //restar el total de las mermas en monto y agregarlo a favor del cliente
      return new Promise(async (resolve, reject) => {
        this.products = ParseJson(this.products)
        let repayment = ParseJson(this)
        repayment.id = await autoincrement(this.db, 'repayments')
        await this.db.collection("repayments").doc(repayment.id.toString()).set(repayment)
        
        let customer = new Customer(this.db);
        await customer.findById(this.cid)
        customer.balance = customer.balance - this.total
        customer.update()

        let order = new Order(this.db); //restar de la orden selecionada
        await order.findOrderById(this.oid)
        order.balance = order.balance - this.total;
        await order.update()

        resolve(repayment)
      });
    }

    async onCash(): Promise<any> {
      //registro de mermas
      //registro de pago negativo
      //restar de los pagos de empleado
      return new Promise(async (resolve, reject) => {
        let repayment = ParseJson(this)
        repayment.id = await autoincrement(this.db, 'repayments')
        await this.db.collection("repayments").doc(repayment.id.toString()).set(repayment)

        let employee = new Employee(this.db)
        await employee.setByIUD(this.eid)

        if(employee.returnsDate && moment().format("Y-M-D") == employee.returnsDate) {
          employee.returns = employee.returns + this.total
        } else {
          employee.returnsDate = moment().format("Y-M-D")
          employee.returns = this.total
        }

        await employee.update()
        resolve(repayment)
      });
    }

    async onGoods(): Promise<any> {
      //registro de mermas
      //salida de stock
      return new Promise(async (resolve, reject) => {
        let repayment = ParseJson(this)
        repayment.id = await autoincrement(this.db, 'repayments')
        await this.db.collection("repayments").doc(repayment.id.toString()).set(repayment)

        let employee = new Employee(this.db)
        await employee.setByIUD(this.eid)

        let outStock = new Stock();
        outStock.products = this.products;
        employee.stock = subStock(employee.stock, outStock)
        console.log(employee.stock, outStock)

        await employee.update()

        resolve(repayment)
      });
    }
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
export class ProductInStock extends Product {
  qty: number;
}

export class ProductInOrder extends ProductInStock {
  stock: number;
}

export class Stock { // Stock de empleado (cuanto se llevo)
  date: string; //fecha de registro en stock
  eid: string;
  products: ProductInStock[] = [];
}