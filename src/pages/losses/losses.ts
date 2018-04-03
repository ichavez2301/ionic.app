import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, AlertController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { ProductsPage } from '../products/products';
import moment from 'moment';
import { AngularFirestore } from "angularfire2/firestore";
import { AngularFireAuth } from "angularfire2/auth";

/**
 * Generated class for the LossesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

interface Repayment {
  date: string,
  oid: string,
  cid: string,
  eid: string,
  total: number,
  pqty: number
}

@IonicPage()
@Component({
  selector: 'page-losses',
  templateUrl: 'losses.html',
})
export class LossesPage {
  public products = [];
  public customer: any;
  public order: any;
  public repayment: Repayment = {
    date: "",
    oid: "",
    eid: "",
    cid: "",
    total: 0,
    pqty: 0
  };
  
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public modalCtrl: ModalController, 
    public alertCtrl: AlertController,
    private afs: AngularFirestore,
    private afa: AngularFireAuth
  ) 
  {
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
    this.repayment.total = 0;
    this.repayment.pqty = 0;

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
      let repaymentCollection = this.afs.collection("repayments", ref => ref.orderBy("id", "desc"))
      repaymentCollection.ref.get()
      .then((res) => {
        let refId = "1";
        if(res.docChanges.length > 0)
          refId = res.docChanges[0].doc.id + 1
        /** crear registro de reembolso */
        this.repayment.eid = this.afa.auth.currentUser.uid
        this.repayment.cid = this.customer.id.toString()
        this.repayment.oid = this.order.id.toString()
        this.repayment.date = moment().format("YYYY-MM-DD hh:mm:ss")
        this.afs.collection("repayments")
          .doc(refId)
          .set(this.repayment)

        /** restar pago del balance general del cliente */
        this.customer.balance = parseFloat(this.customer.balance) - this.repayment.total
        this.afs.collection("customers")
          .doc(this.customer.id.toString())
          .set(this.customer)

        /** restar pago a nota de credito */
        this.order.balance = parseFloat(this.order.balance) - this.repayment.total
        this.afs.collection("orders").doc(this.order.id.toString()).set(this.order)

        
        this.products.forEach((product) => {
          product["customer"] = this.customer
          product["cid"] = this.customer.id.toString()
          product["date"] = moment().format("YYYY-MM-DD hh:mm:ss")
          this.afs.collection("productsReturns")
            .add(product)
        })

        //regresar a home
        this.navCtrl.setRoot(HomePage)
      })
    }
    else 
    {
      alert("Agregue al menos un producto para continuar.")
    }
  }
}
