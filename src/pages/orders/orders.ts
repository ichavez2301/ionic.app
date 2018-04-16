import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreCollection } from "angularfire2/firestore";
import { AngularFireAuth } from 'angularfire2/auth'
import 'rxjs/add/operator/map'

import { ProductsPage } from '../products/products'
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { HomePage } from '../home/home';
import moment from 'moment'
import { PaymentProvider } from '../../providers/payment/payment';
import { Order } from '../../providers/order/order';
/**
 * Generated class for the OrdersPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@IonicPage()
@Component({
  selector: 'page-orders',
  templateUrl: 'orders.html',
})
export class OrdersPage {
  public orderCollection: AngularFirestoreCollection<Order>
  
  public form: Order = { 
    customer: {
      address: "",
      balance: 0,
      company: "",
      contact: "",
      eid: 0,
      email: "",
      id: 0,
      limit_credit: 0,
      more_price: 0,
      phone: "",
      postal_code: ""
    },
    products: [],
    eid: "",
    cid: 0,
    data: moment().format("YYYY-MM-DD"),
    orderType: "contado",
    total: 0,
    balance: 0,
    amount: 0
  };

  public employee = null;  
  public productsOnOrder = [];

  constructor(
    public paymentProvider: PaymentProvider,
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    private afs: AngularFirestore,
    private afa: AngularFireAuth
  ) {
    this.form.customer = this.navParams.data;
    this.employee = this.afa.auth.currentUser.uid
  }

  addProduct() {
    let modal = this.modalCtrl.create(ProductsPage, { customer: this.form.customer })

    modal.present();
    modal.onDidDismiss((product) => {
      if(product) {
        product["qty"] = 1;
        this.productsOnOrder.push(product)
        this.updateTotal()
      }
    })
  }

  updateTotal() {
    this.form.total = 0
    for(let index in this.productsOnOrder) 
      this.form.total += parseFloat(this.productsOnOrder[index].price) * parseInt(this.productsOnOrder[index].qty); 
  }
  
  deleteItem(index){
    this.productsOnOrder.splice(index, 1)
    this.updateTotal()
  }

  doSale() {
    if(this.productsOnOrder.length == 0) {
      alert("Seleccione al menos un producto")
      return
    }
    
    let myinputs = [];
    if(this.form.orderType == 'credito') {
      myinputs.push({
        label: 'Recibí',
        name: 'amount',
        placeholder: "$",
      })
    }

    let prompt = this.alertCtrl.create({
      title: 'Terminar Pedido' ,
      message: 'Total: $ ' + this.form.total.toString(),
      inputs: myinputs,
      buttons: [{
        text: 'Cancelar',
        handler: data => {
          console.log('Cancel clicked');
        }
      }, {
        text: 'Guardar',
        handler: data => {
          this.form.amount  = parseFloat(data.amount);
          if(this.form.amount >= 0) {
            this.form.balance = parseFloat(this.form.total.toString()) - this.form.amount
            this.saveOrder()
          } else {
            alert("Debe agregar una cantidad valida para continuar.")
          }
        }
      }]
    });
    
    prompt.present()
  }

  saveOrder() {
    if(this.productsOnOrder.length > 0) {
      this.form["cid"] = this.form.customer.id
      this.form["products"] = this.productsOnOrder
      this.orderCollection = this.afs.collection("orders", ref => ref.orderBy("id", "desc"))

      this.orderCollection.ref.orderBy("id", "desc").get()
      .then((res) => {
        let newId = 1        
        if(res.docChanges.length > 0)
          newId = parseInt(res.docChanges[0].doc.data().id) + 1
          if(true) {
          //create order
          this.orderCollection.ref.doc(newId.toString())
          .set({
            id        : newId,
            amount    : this.form.amount,
            balance   : this.form.balance,
            cid       : this.form.customer.id,
            eid       : this.employee,
            customer  : this.form.customer,
            data      : moment().format("Y-MM-DD HH:mm"),
            orderType : this.form.orderType,
            products  : this.productsOnOrder,
            total     : this.form.total
          }).then((res) => {
            
            let currentCustomer = this.form.customer
            currentCustomer.balance = parseFloat(currentCustomer.balance.toString()) + parseFloat(this.form.balance.toString())

            this.afs.collection("customers").doc(this.form.customer.id.toString())
              .update(currentCustomer)

            //this.form.customer.more_price = parseFloat(this.form.customer.more_price)
            let payment = {
              customer  : this.form.customer,
              amount    : this.form.amount,
              oid       : newId,
              eid       : this.afa.auth.currentUser.uid,
              cid       : this.form.customer.id,
              date      : moment().format("YYYY-MM-DD HH:mm"),
              return    : false
            };
            
            this.paymentProvider.create(payment).then(() => {
              this.productsOnOrder
              .forEach((product) => {
                this.afs.collection("productsSales")
                .add({
                  employee_id: this.form.customer.eid,
                  customer_id: this.form.customer.id,
                  order_id: newId,
                  price: product.price,
                  qty: product.qty,
                  category: product.category,
                  product_id: product.id,
                  date: moment().format("YYYY-MM-DD HH:mm")
                })
              })
  
              this.navCtrl.setRoot(HomePage)
            })


            //actualizar las ventas y pagos del dia del empleado
            this.afs.collection("employees").ref.where("uid", "==", this.employee).get()
            .then((res) => {
              if(res.docChanges.length > 0) {
                let oldDataEmployee = res.docChanges[0].doc.data()
                
                if(oldDataEmployee.paymentDate == moment().format("YYYY-MM-DD")) {
                  oldDataEmployee.paymentsToday = parseFloat(oldDataEmployee.paymentsToday.toString()) + parseFloat(this.form.amount.toString())
                  oldDataEmployee.salesToday = parseFloat(oldDataEmployee.salesToday) + parseFloat(this.form.total.toString())
                } else {
                  oldDataEmployee.paymentsToday = this.form.amount
                  oldDataEmployee.salesToday = this.form.total
                }
                
                oldDataEmployee.saleDay = moment().format("YYYY-MM-DD")
                oldDataEmployee.paymentDate = moment().format("YYYY-MM-DD")

                this.afs.collection("employees").doc(oldDataEmployee.id.toString())
                .set(oldDataEmployee)
              }
            })
            //batch products info 
          })
        }
      })
    } else {
      alert("Agregue un producto a la orden")
    }
  }

}
