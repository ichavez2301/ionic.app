import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ModalController } from 'ionic-angular';
import { Repayment, ReturnModeTypes, Employee } from '../../classes/structs';
import { SelectCreditNotePage } from '../select-credit-note/select-credit-note';
import { SessionProvider } from '../../providers/session/session';

@IonicPage()
@Component({
  selector: 'page-return-mode',
  templateUrl: 'return-mode.html',
})
export class ReturnModePage {

  public stockIndexed = {};
  public returnGoodsDisabled = false;

  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public modalCtrl: ModalController,

    public session: SessionProvider,
    public employee: Employee,
    public repayment: Repayment,
    public navParams: NavParams) {
  }

  async ionViewDidLoad() {
    let oldRepayment: Repayment = this.navParams.get("repayment")
    this.repayment.cid = oldRepayment.cid
    this.repayment.date = oldRepayment.date
    this.repayment.eid = oldRepayment.eid
    this.repayment.id = oldRepayment.id
    this.repayment.oid = oldRepayment.oid
    this.repayment.pqty = oldRepayment.pqty
    this.repayment.products = oldRepayment.products
    this.repayment.returnMode = oldRepayment.returnMode
    this.repayment.total = oldRepayment.total
    
    // validar si la mercancia a regresar la tengo en stock
    await this.employee.setByIUD(this.session.CurrentUser.uid)
    this.stockIndexed = this.employee.stockIndexed()
    if(this.repayment.products) {

      this.repayment.products.forEach((product) => {
        if(product.qty > this.stockIndexed[product.id].qty) {
          this.returnGoodsDisabled = true
        }
      })
    }
  }

  doReturn() {
    let promise: Promise<any>;
    switch(this.repayment.returnMode) {
      case ReturnModeTypes.toAccount:
        promise = new Promise((resolve, reject) => {
          let modal = this.modalCtrl.create(SelectCreditNotePage, { cid: this.repayment.cid })
          modal.present()
          resolve()
        })
        
        //promise = this.repayment.onAccount()
        break;
      case ReturnModeTypes.Cash:
        promise = this.repayment.onCash()
        break;
      case ReturnModeTypes.Goods:
        promise = this.repayment.onGoods()
        break;
    }

    promise.then(() => {
      alert("La devolución se generó correctamente.")
      this.viewCtrl.dismiss()
    })
  }

  dismiss(){
    this.viewCtrl.dismiss()
  }

}
