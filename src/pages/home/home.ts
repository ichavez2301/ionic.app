import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { ActionSheetController } from 'ionic-angular';

import { OrdersPage } from '../orders/orders'
import { CreditsPage } from '../credits/credits'

import { MapNavigationProvider } from '../../providers/map-navigation/map-navigation'

import { AddStockPage } from '../add-stock/add-stock';
import { RoutesProvider } from '../../providers/routes/routes';

import { SessionProvider } from '../../providers/session/session';
import { Customer as LocalCustomer } from '../../classes/structs'
import { Employee as LocalEmployee } from '../../classes/structs';
import { LossesPage } from '../losses/losses';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'

})
export class HomePage implements OnInit {
  
  public customers: LocalCustomer[] = []; 
  public customersOld: LocalCustomer[] = [];
  

  constructor(
    public navCtrl: NavController, 
    public actionSheetCtrl: ActionSheetController,
    public alertCtrl: AlertController,
    
    /** RECODING */
    public employee: LocalEmployee,
    public session: SessionProvider,
    /** RECODING END */
    
    public MapNavigation: MapNavigationProvider) 
  {
  }

  async ngOnInit(refresher?) {
    this.customers = []; //reiniciar variable para limpiar busqueda

    if(await this.session.exists()) {
      await this.employee.setByIUD(this.session.CurrentUser.uid)
      this.LoadCustomerList(refresher);    
    }   
  }
  
  LoadCustomerList(refresher?) {
    this.employee.getMyCustomerList()
    .then((res:any) => {
      
      if(refresher) 
        refresher.complete()

      this.customers = res
      this.customersOld = res
    });
  }

  showWindowAddStock() {
    this.navCtrl.setRoot(AddStockPage)
  }

  itemSelected(customer) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Opciones',
      buttons: [{
        icon: 'list-box',
        text: 'Nuevo Pedido',
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
        text: 'Notas de crédito',
        handler: () => {
          if(customer.balance > 0)
            this.navCtrl.push(CreditsPage, customer)
          else
            alert("El cliente no cuenta con adeudo!")
        }
      }, 
      {
        icon: 'trending-down',
        text: 'Mermas',
        handler: () => {
          this.navCtrl.push(LossesPage, {customer: customer})
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
      }]
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
        checked: (route.id == this.employee.rid)
      });
      
    })
    

    alert.addButton('Cancelar');
    alert.addButton({
      text: 'OK',
      handler: data => {
        if(this.employee.rid != data)
          this.updateEmployee(parseInt(data))
      }
    });
    alert.present();
  }
  
  updateEmployee(data) {
    this.employee.rid = data
    this.employee.update().then(() => { this.ngOnInit(); })
  }

  getItems(ev: any) { //evento para busqueda
    this.customers = this.customersOld
    let val = ev.target.value;

    if (val && val.trim() != '') {
      if(this.customers.length > 0) {
        this.customers = this.customers.filter((item) => {
          return (item.company.toLowerCase().indexOf(val.toLowerCase()) > -1)
        })
      }
    }
  }

}
