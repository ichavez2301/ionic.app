import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { ProductsPage } from '../products/products';
import moment from 'moment';
import { AngularFireAuth } from "angularfire2/auth";
import { RepaymentsProvider, Repayments } from "../../providers/repayments/repayments";
import { CustomerProvider, Customer } from '../../providers/customer/customer'
import { OrderProvider } from '../../providers/order/order';
import { ReturnsProvider } from '../../providers/returns/returns'
/**
 * Generated class for the LossesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-losses',
  templateUrl: 'losses.html',
})
export class LossesPage {
  public products = [];
  public customer: Customer;
  public order: any;
  public repayment: Repayments
  
  constructor(
    public repaymentProvider: RepaymentsProvider,
    public customerProvider: CustomerProvider,
    public orderProvider: OrderProvider,
    public returnProvider: ReturnsProvider,
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public modalCtrl: ModalController, 
    public alertCtrl: AlertController,
    private afa: AngularFireAuth
  ) 
  {
    this.repayment      = new Repayments()
    this.repayment.date = moment().format("Y-MM-DD")
    this.customer       = this.navParams.get("customer")
    this.order          = this.navParams.get("order")
  }
  _parseFloat(val) {
    return parseFloat(val)
  }
  addProduct() {
    let productModal = this.modalCtrl.create(ProductsPage, {customer : this.customer, order: this.order})
    productModal.present()

    productModal.onDidDismiss((data) => {
      if(data) {
        data["qtySold"] = data["qty"] || 0
        data["qty"]     = 1
        this.products.push(data)
        this.UpdateTotal()
      }
    })
  }

  UpdateTotal() {
    this.repayment.total  = 0;
    this.repayment.pqty   = 0;

    this.products.forEach((product) => {
      this.repayment.total += parseFloat(product.price) * parseFloat(product.qty);
      this.repayment.pqty  += parseInt(product.qty);
    })
  }

  validateQty(ev) {
    if(parseFloat(ev.qty) > parseFloat(ev.qtySold)) {
      alert("La cantidad devuelta no puede ser mayor a la adquirida!")
      ev.qty = ev.qtySold
    }
    this.UpdateTotal()
  }

  saveRepayment() {
    let confirm = this.alertCtrl.create({
      title: 'Registrar devoluciones',
      message: 'Esta seguro de enviar las siguientes cantidades?',
      buttons: [{
          text: 'Cancelar',
          handler: () => {
            console.log('Disagree clicked');
          }
        },{
          text: 'Enviar',
          handler: () => {
            this.createRepayment()
          }
        }]
    });
    confirm.present();
  }

  createRepayment() {
    //crear registro de devolucion
    if(this.products.length > 0) {
      this.repayment.eid = this.afa.auth.currentUser.uid
      this.repayment.cid = this.customer.id.toString()
      this.repayment.oid = this.order.id.toString()
      this.repayment.date = moment().format("YYYY-MM-DD hh:mm:ss")

      this.repaymentProvider.create(this.repayment)
      .then(() => {
        //logica de negocios de devoluciones
        this.customer.balance = this.customer.balance - this.repayment.total

        this.customerProvider.update(this.customer, this.customer.id)
        this.orderProvider.update(this.order, this.order.id)
        this.products.forEach((product) => {
          product.customer  = this.customer
          product.cid       = this.customer.id.toString()
          product.eid       = this.afa.auth.currentUser.uid
          product.date      = moment().format("YYYY-MM-DD hh:mm:ss")

          this.returnProvider.create(product)
        })
        //add product return

        this.navCtrl.setRoot(HomePage)
      })
    } else  {
      alert("Agregue al menos un producto para continuar.")
    }

  }
}
