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
import { Order, OrderProvider } from '../../providers/order/order';
import { CustomerProvider } from '../../providers/customer/customer';
import { EmployeesProvider } from '../../providers/employees/employees';
import { Product } from '../../providers/products/products';
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
      rid: 0,
      address: "",
      balance: 0,
      company: "",
      contact: "",
      eid: 0,
      email: "",
      id: 0,
      limit_credit: 0,
      discount: 0,
      phone: "",
      postal_code: ""
    },
    products: [],
    eid: "",
    cid: 0,
    date: moment().format("YYYY-MM-DD"),
    orderType: "contado",
    total: 0,
    balance: 0,
    amount: 0
  };

  public uid = null;  
  public productsOnOrder: Array<Product> = [];

  constructor(
    public employeeProvider: EmployeesProvider,
    public orderProvider: OrderProvider,
    public customerProvider: CustomerProvider,
    public paymentProvider: PaymentProvider,
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    private afs: AngularFirestore,
    private afa: AngularFireAuth
  ) {
    this.form.customer  = this.navParams.data;
    this.uid            = this.afa.auth.currentUser.uid
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
    for(let index in this.productsOnOrder) {
      this.form.total += this.productsOnOrder[index].price * this.productsOnOrder[index].qty; 
    }
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
          this.form.amount  = (this.form.orderType == 'credito') ? parseFloat(data.amount) : this.form.total;
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
    //guardar orden
    if(this.productsOnOrder.length > 0) {
      
      this.form.cid = this.form.customer.id
      this.form.products = this.productsOnOrder
      this.form.eid = this.uid
      //crear orden
      //actualizar cliente
      //crear pago
      //actualizar saldo empleado
      this.orderProvider.create(this.form)
      .then((res: any) => {
        let newId :number = this.orderProvider.lastInsertId();
        let currentCustomer = this.form.customer
        currentCustomer.balance = currentCustomer.balance + this.form.balance
        
        this.customerProvider.update(currentCustomer, this.form.customer.id)
        .then(() => {
          let payment = {
            customer  : this.form.customer,
            amount    : this.form.amount,
            oid       : newId,
            eid       : this.uid,
            cid       : this.form.customer.id,
            date      : moment().format("YYYY-MM-DD HH:mm"),
            return    : false
          };

          this.paymentProvider.create(payment)
          .then(() => {
            this.employeeProvider.ref().where("uid", "==", this.uid)
            .get().then((res) => {
              let oldEmployee: any = res.docChanges[0].doc.data()

              if(oldEmployee.paymentDate == moment().format("YYYY-MM-DD")) {
                oldEmployee.paymentsToday = oldEmployee.paymentsToday + this.form.amount
                oldEmployee.salesToday = oldEmployee.salesToday + this.form.total
              } else {
                oldEmployee.paymentsToday = this.form.amount
                oldEmployee.salesToday = this.form.total
              }
              oldEmployee.saleDay = moment().format("YYYY-MM-DD")
              oldEmployee.paymentDate = moment().format("YYYY-MM-DD")

              this.employeeProvider.update(oldEmployee, oldEmployee.id)
              .then(() => {
                this.productsOnOrder.forEach((product) => {
                  this.afs.collection("productsSales")
                  .add({
                   // rid         : this.form.customer.rid,
                    customer_id : this.form.customer.id,
                    order_id    : newId,
                    price       : product.price,
                    qty         : product.qty,
                    category    : product.category,
                    product_id  : product.id,
                    date        : moment().format("YYYY-MM-DD HH:mm")
                  })
                })
    
                this.navCtrl.setRoot(HomePage)
              })
            })
          })
        })
      })


    } else {
      alert("Agregue un producto a la orden")
    }
  }

}
