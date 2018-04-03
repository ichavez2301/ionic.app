import { Component, OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ActionSheetController } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreCollection } from "angularfire2/firestore";
import { AngularFireAuth } from 'angularfire2/auth'

import 'rxjs/add/operator/map'
import { Observable } from 'rxjs/Observable';

import { OrdersPage } from '../orders/orders'
import { CreditsPage } from '../credits/credits'

import { MapNavigationProvider } from '../../providers/map-navigation/map-navigation'

interface Customer {
  id:string,
  address:string,
  balance:number,
  company:string,
  contact:string,
  eid:string,
  email:string,
  limit_credit: string,
  more_credit: number,
  phone:string,
  postal_code: string
}

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'

})
export class HomePage implements OnInit {
  public customersCollection: AngularFirestoreCollection<Customer>;
  public customers: Observable<Customer[]>;
  public customersOld: any;

  constructor(
    public navCtrl: NavController, 
    public actionSheetCtrl: ActionSheetController, 
    private afs: AngularFirestore,
    private afa: AngularFireAuth,
    public MapNavigation: MapNavigationProvider) 
  {

  }

  ngOnInit() {
    this.afa.auth.onAuthStateChanged((res) => {
      if(res != null) {
        this.afs.collection("employees").ref.where("uid", "==", res.uid).get()
          .then((res) => {
            if(res.docChanges.length > 0) { 
              this.customersCollection = this.afs.collection("customers", ref => ref.where("eid", "==", parseInt(res.docChanges[0].doc.id)).orderBy("company", "asc"))
              this.customers = this.customersCollection.valueChanges()
              this.customersOld = Object.assign({}, this.customers);
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
            this.navCtrl.push(OrdersPage, customer)
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
        /*{
          icon: 'share-alt',
          text: 'Registrar mermas',
          handler: () => {
            this.navCtrl.push(LossesPage, customer)
          }
        }*/{
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

  // getItems(ev: any) {
  //   this.customers = this.customersOld
  //   let val = ev.target.value;

  //   if (val && val.trim() != '') {
  //     this.customers = this.customers.filter((item) => {
  //       let answer = false;
  //       item.filter((company) => {
  //         answer = (company.company.toLowerCase().indexOf(val.toLowerCase()) > -1);
  //         return answer
  //       })
  //       return answer
  //     })
  //   }
  // }

}
