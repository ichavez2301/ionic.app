import { Injectable } from '@angular/core';
import * as firebase from 'firebase'
import { config } from './firebase.config'
/*
  Generated class for the FirebaseProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class FirebaseProvider {

  public instance: any;
  public firestore: any;
  public currentUser = null;

  constructor() {
    this.initailize()
    this.firestore = this.instance.firestore()
  }

  initailize() {
    this.instance = firebase.initializeApp(config)
  }

  getEmployeeById(id) {
    return this.firestore.collection("employees").doc(id)
    //return this.instance.database().ref("employees/" + id)
  }

  public HasSession():Boolean {
    this.currentUser = this.instance.auth().currentUser;
    if(this.instance.auth().currentUser)
      return true

    return false
  }

  public SignIn(email:String, password:String) {
    return this.instance.auth().signInWithEmailAndPassword(email, password)
  }

  public GetCustomers() {
    return this.instance.database().ref("customers")
  }

  public GetProduct() {
    return this.instance.database().ref("products")
  }

  public CreateOrder(order, products, employee) {
    let db = this.instance.database()
    let id = db.ref().child('orders').push().key
    let updates = {}
    let date = new Date()
    let dateString = date.getDate().toString() + date.getMonth().toString() + date.getFullYear().toString()
    let user = this.instance.auth().currentUser

    order["products"] = products
    updates['orders/' + order.customer.id + '/' + id] = order
    updates["orders-bydate/" + dateString + "/" + order.customer.id] = order
    updates["orders-employees/" + user.uid + "/" + id] = order
    // si se realizo pago mayor a 0 se hace un registro en pagos
    if(order.amount > 0) { 
      //actualizar el balance del clientes
      order.balance = (parseFloat(order.total) - parseFloat(order.amount))
      updates["customers/" + order.customer.id] = order.customer
      
      //registar indice para reportes de cliente
      let idPayment = db.ref().child("payments").push().key
      let paymentData = {
        id: idPayment,
        amount: order.amount,
        customer: order.customer,
        date: new Date()
      }

      updates["payments/" + order.customer.id + "/" + idPayment] = paymentData
      //registrar indice para reportes de empleados
      updates["payments-employees/" + user.uid + "/" + idPayment] = paymentData
      //registrar indice para reportes por fecha
      updates["payments-bydate/" + dateString + "/" + order.customer.id] = paymentData

      /**  actualizar perfil de empleado c*/
      if(employee.saleDate != dateString)
        employee.salesToday = 0
      if(employee.paymentsToday != dateString)
        employee.paymentsToday = 0
      
      employee.salesToday = parseFloat(employee.salesToday) + parseFloat(order.total)
      employee.paymentsToday = parseFloat(employee.paymentsToday) + parseFloat(order.amount)
      updates["employees/" + employee.id] = employee
      /** fin actualizar perfil de empleado */
    }

    order.customer.balance = parseFloat(order.customer.balance) + parseFloat(order.balance)
    updates["customers/" + order.customer.id] = order.customer
    db.ref().update(updates)
  }

  public CreatePayment(params, customer) {
    let db = this.instance.database();
    let id = db.ref().child("payments").push().key
    let updates = {}
    params["createdAt"] = Date.now()
    params["id"] = id

    /** TRANSACTION */
    let date = new Date()
    let dateString = date.getDate().toString() + date.getMonth().toString() + date.getFullYear().toString()
    let user = this.instance.auth().currentUser;

    params["customer"] = customer
    updates["payments/" + customer.id + "/" + id] = params
    updates["payments-employees/" + user.uid + "/" + dateString + "/" + id] = params
    updates["payments-bydate/" + dateString + "/" + customer.id] = params
    customer.balance = customer.balance - params.amount
    updates["customers/" + customer.id] = customer

    db.ref().update(updates)
  }

}
