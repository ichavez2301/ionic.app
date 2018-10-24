import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, LoadingController } from 'ionic-angular';

import { ProductsPage } from '../products/products'
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import moment from 'moment'
import { CreateOrderPage } from '../create-order/create-order';
import { Order as LocalOrder, ProductInOrder, ProductInStock } from '../../classes/structs';
import { SessionProvider } from '../../providers/session/session';
import { HomePage } from '../home/home';


@IonicPage()
@Component({
  selector: 'page-orders',
  templateUrl: 'orders.html',
})
export class OrdersPage implements OnInit {
  
  public uid = null;  
  public productsOnOrder: Array<ProductInOrder> = [];
  public productIndex = {};
  constructor(
    public modal: ModalController,
    public loadingCtrl: LoadingController,
    
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public modalCtrl: ModalController,
    public alertCtrl: AlertController,
    
    public order: LocalOrder,
    private session: SessionProvider
  ) {}

  ngOnInit() { // start scene
    this.order.customer  = this.navParams.data;
    this.order.date      = moment().format("Y-M-D");
    this.uid            = this.session.CurrentUser.uid
  }

  addProduct() {
    let modal = this.modalCtrl.create(ProductsPage, { customer: this.order.customer })

    modal.present();
    modal.onDidDismiss((product: ProductInStock) => {
      if(product) {
        if(!this.productIndex[product.id]) {
          this.productIndex[product.id] = true

          let productInOrder = new ProductInOrder();
          productInOrder.id = product.id
          productInOrder.name = product.name
          productInOrder.price = product.price
          productInOrder.qty = 1; //una orden inicia con un producto
          productInOrder.stock = product.qty //cantidad en stock

          this.productsOnOrder.push(productInOrder)
          this.updateTotal()
        }
      }
    })
  }

  updateTotal() {
    this.order.total = 0
    for(let index in this.productsOnOrder) {
      if(this.productsOnOrder[index].qty.toString() != "") {
        if(parseInt(this.productsOnOrder[index].qty.toString()) <= parseInt(this.productsOnOrder[index].stock.toString())) {
          this.order.total += this.productsOnOrder[index].price * this.productsOnOrder[index].qty; 
        } else {
          alert("Has agregado una cantidad que supera a tu stock (" + this.productsOnOrder[index].name + ")")
          this.productsOnOrder[index].qty = this.productsOnOrder[index].stock
          this.updateTotal();
        }
      }
    }
  }
  
  deleteItem(index, id){
    this.productsOnOrder.splice(index, 1)
    delete this.productIndex[id]
    this.updateTotal()
  }

  doSale() {
    if(this.productsOnOrder.length == 0) {
      alert("Seleccione al menos un producto")
      return
    }

    let orderModal = this.modal.create(CreateOrderPage, { data: this.order })
    orderModal.onDidDismiss((result) => {
      if(result) {
        // regreso los valores con tipo de orden(credito|contado) y el anticipo en caso de ser nota de credito
        this.order          = result
        this.order.eid      = this.session.CurrentUser.uid
        this.order.products = this.productsOnOrder
        this.order.balance  = this.order.total
        
        // preloader
        let loading = this.loadingCtrl.create({content: 'Guardando orden, espere porfavor...'})
        loading.present()

        this.order.save()
        .then(() => {
          loading.dismiss()
          alert("La orden se guardo correctamente.")
          this.navCtrl.setRoot(HomePage)
        })
      }
    })

    orderModal.present()
  }

}
