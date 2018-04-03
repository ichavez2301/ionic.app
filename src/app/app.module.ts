import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { LoginPage } from '../pages/login/login';
import { OrdersPage } from '../pages/orders/orders';
import { ProductsPage } from '../pages/products/products';
import { PaymentPage } from '../pages/payment/payment';
import { ExpensesPage } from '../pages/expenses/expenses';
import { LossesPage } from '../pages/losses/losses';
import { CreditsPage } from '../pages/credits/credits';
import { ExpensesListPage } from '../pages/expenses-list/expenses-list';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { HttpModule } from '@angular/http';
import { MapNavigationProvider } from '../providers/map-navigation/map-navigation';
import { config } from '../providers/firebase/firebase.config';
import { AngularFireAuthModule } from 'angularfire2/auth'

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    LoginPage,
    OrdersPage,
    ProductsPage,
    PaymentPage,
    ExpensesPage,
    LossesPage,
    CreditsPage,
    ExpensesListPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(config),
    AngularFirestoreModule.enablePersistence(),
    AngularFirestoreModule,
    AngularFireAuthModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    LoginPage,
    OrdersPage,
    ProductsPage,
    PaymentPage,
    ExpensesPage,
    LossesPage,
    CreditsPage,
    ExpensesListPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    MapNavigationProvider
  ]
})
export class AppModule {}
