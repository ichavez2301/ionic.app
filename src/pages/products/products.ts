import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

import { Employee as LocalEmployee, Order, Customer, Product } from '../../classes/structs'
import { ProductInStock as LocalProductInStock } from '../../classes/structs'

@IonicPage()
@Component({
  selector: 'page-products',
  templateUrl: 'products.html',
})
export class ProductsPage implements OnInit { 
  products: LocalProductInStock[] = [];
  customer: Customer;
  order: Order;
  isCollection: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams, 
    public viewCtrl: ViewController,
    public productCtrl: Product,
    public employee: LocalEmployee) {}

  async ngOnInit() {
    this.customer = this.navParams.get("customer")
    this.order    = this.navParams.get("order")
    
    this.products = this.employee.stock.products
    
  }
  
  itemSelected(product: LocalProductInStock) {
    if(product.qty > 0 || this.order) 
    {
      if(this.isCollection)
        product.price = product.price - this.customer.discount
      else 
        product.price = product.price
        
      this.viewCtrl.dismiss(product)
    } 
    else 
    {
      alert("No cuenta con stock de este producto.");
    }
  }

  dismiss() {
    this.viewCtrl.dismiss(null)
  }
  _parseFloat(val) {
    return parseFloat(val)
  }

}
