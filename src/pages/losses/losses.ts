import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController } from 'ionic-angular';
import { ProductsPage } from '../products/products';
import moment from 'moment';
import { AngularFireAuth } from "angularfire2/auth";

import { CustomerProvider, Customer } from '../../providers/customer/customer'
import { OrderProvider } from '../../providers/order/order';
import { ReturnsProvider } from '../../providers/returns/returns'
import { ReturnModePage } from '../return-mode/return-mode';
import { Repayment } from '../../classes/structs';

@IonicPage()
@Component({
  selector: 'page-losses',
  templateUrl: 'losses.html',
})
export class LossesPage {
  public products = [];
  public customer: Customer;
  public order: any;
  public repayment: Repayment;
  public disabled: boolean = false;
  public indexAdded = {}
  
  constructor(
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
    this.repayment      = new Repayment()
    this.repayment.date = moment().format("Y-MM-DD")
    this.customer       = this.navParams.get("customer")
    this.order          = this.navParams.get("order")

    this.repayment.eid = this.afa.auth.currentUser.uid
    this.repayment.cid = this.customer.id
    //this.repayment.oid = this.order.id
    this.repayment.date = moment().format("YYYY-MM-DD")

    console.log(this.repayment)
  }
  _parseFloat(val) {
    return parseFloat(val)
  }
  addProduct() {
    let productModal = this.modalCtrl.create(ProductsPage, {
      customer : this.customer, order: true
    })

    productModal.present()

    productModal.onDidDismiss((data) => {
      data = Object.assign({}, data)
      if(data && !this.indexAdded[data.id]) {
        this.indexAdded[data.id] = true;
        
        data["qtySold"] = data["qty"] || 0
        data["qty"]     = 1
        this.repayment.products.push(Object.assign({}, data))
        this.UpdateTotal()
      }
    })
  }

  UpdateTotal() {
    this.repayment.total  = 0;
    this.repayment.pqty   = 0;

    this.repayment.products.forEach((product) => {
      if(typeof product.qty == 'string')
        product.qty = parseFloat(product.qty)

      this.repayment.total += product.price * product.qty;
      this.repayment.pqty  += product.qty;
    })
  }

  validateQty(ev) {
    // if(parseFloat(ev.qty) > parseFloat(ev.qtySold)) {
    //   alert("La cantidad devuelta no puede ser mayor a la adquirida!")
    //   ev.qty = ev.qtySold
    // }
    this.UpdateTotal()
  }

  saveRepayment() {
    if(!this.disabled) {
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
              //this.createRepayment()
              let modal = this.modalCtrl.create(ReturnModePage, { repayment: this.repayment })
              modal.present()
              modal.onDidDismiss(() => {
                this.navCtrl.popToRoot();
              })
            }
          }]
      });
      confirm.present();
    }
  }

  deleteItem(i) {
    this.repayment.products.splice(i, 1)
    this.UpdateTotal()
  }
}

