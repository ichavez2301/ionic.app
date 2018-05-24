import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { ActionSheetController } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreCollection } from "angularfire2/firestore";
import { AngularFireAuth } from 'angularfire2/auth'

import 'rxjs/add/operator/map'
import { Observable } from 'rxjs/Observable';

import { OrdersPage } from '../orders/orders'
import { CreditsPage } from '../credits/credits'

import { MapNavigationProvider } from '../../providers/map-navigation/map-navigation'
import { Customer, CustomerProvider } from '../../providers/customer/customer';
import { StockProvider } from '../../providers/stock/stock';
import moment from 'moment'
import { AddStockPage } from '../add-stock/add-stock';
import { RoutesProvider } from '../../providers/routes/routes';
import { EmployeesProvider, Employee } from '../../providers/employees/employees';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'

})
export class HomePage implements OnInit {
  public customersCollection: AngularFirestoreCollection<Customer>;
  public customers: Customer[] = []; 
  public customersOld: Customer[] = [];
  public currentEmployee: any = new Employee();

  constructor(
    public navCtrl: NavController, 
    public stockService: StockProvider,
    public actionSheetCtrl: ActionSheetController, 
    private afs: AngularFirestore,
    private afa: AngularFireAuth,
    public alertCtrl: AlertController,
    public employeeService: EmployeesProvider,
    public customerService: CustomerProvider,
    public MapNavigation: MapNavigationProvider) 
  {

  }

  ngOnInit() {
    this.customers = [];

    this.afa.auth.onAuthStateChanged((res) => {
      if(res != null) {
        let uid = this.afa.auth.currentUser.uid

        this.stockService.ref()
        .where("eid", "==", uid)
        .where("date", "==", moment().format("Y-MM-DD"))
        .get()
        .then((res) => {
          if(res.docChanges.length == 0) {
            this.navCtrl.setRoot(AddStockPage)
          }
        })


        this.afs.collection("employees").ref.where("uid", "==", res.uid).get()
          .then((res) => {
            if(res.docChanges.length > 0) { 
              this.currentEmployee = res.docChanges[0].doc.data()

              this.customerService.ref()
              .orderBy("company", "asc")
              .where("rid", "==", parseInt(this.currentEmployee.rid))
              .get()
              .then((res) => {
                if(res.docChanges.length > 0) {
                  res.docChanges.forEach((doc: any) => {
                    let customer = doc.doc.data()
                    this.customers.push(customer)
                  })

                  this.customersOld = this.customers;
                } else {
                  this.customersOld = []
                }
              })
            }
          })
      }
    })      
  }

  itemSelected(customer) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Opciones',
      buttons: [
        {
          icon: 'list-box',
          text: 'Nuevo Pedido',
          role: 'destructive',
          handler: () => {
            if(parseFloat(customer.balance) >= parseFloat(customer.limit_credit)) {
              alert("Este cliente ha superdado su limite de credito.")
            } else {
              this.navCtrl.push(OrdersPage, customer)
            }
          }
        }, 
        {
          icon: 'card',
          text: 'Notas de credito',
          handler: () => {
            if(customer.balance > 0)
              this.navCtrl.push(CreditsPage, customer)
            else
              alert("El cliente no cuenta con adeudo!")
          }
        }, 
        {
          icon: 'map',
          text: 'Mapa',
          handler: () => {
            if(customer.address != '')
              this.MapNavigation.open({address: customer.address })
          }
        },{
          icon: 'close',
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    })

    actionSheet.present();
  }

  changeRoute() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Cambiar de ruta');

    RoutesProvider.routes.forEach((route) => {
      alert.addInput({
        type: 'radio',
        label: route.name,
        value: route.id.toString(),
        checked: (route.id == this.currentEmployee.rid)
      });
      
    })
    

    alert.addButton('Cancelar');
    alert.addButton({
      text: 'OK',
      handler: data => {
        if(this.currentEmployee.rid != data)
          this.updateEmployee(data)
      }
    });
    alert.present();
  }
  
  updateEmployee(data) {
    this.currentEmployee.rid = data
    this.employeeService.update(this.currentEmployee, this.currentEmployee.id)
    .then(() => {
      this.ngOnInit()
    })
  }

  getItems(ev: any) {
    this.customers = this.customersOld
    let val = ev.target.value;

    if (val && val.trim() != '') {
      if(this.customers.length > 0) {
        this.customers = this.customers.filter((item) => {
          let answer = false;
          return (item.company.toLowerCase().indexOf(val.toLowerCase()) > -1)
        })
      }
    }
  }

}
