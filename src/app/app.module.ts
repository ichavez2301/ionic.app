import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';

import { LoginPageModule } from '../pages/login/login.module';
import { OrdersPageModule } from '../pages/orders/orders.module';
import { ProductsPageModule } from '../pages/products/products.module';
import { PaymentPageModule } from '../pages/payment/payment.module';
import { ExpensesPageModule } from '../pages/expenses/expenses.module';
import { LossesPageModule } from '../pages/losses/losses.module';
import { CreditsPageModule } from '../pages/credits/credits.module';
import { ExpensesListPageModule } from '../pages/expenses-list/expenses-list.module';
import { PaymentsTodayPageModule } from '../pages/payments-today/payments-today.module'

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { HttpModule } from '@angular/http';
import { MapNavigationProvider } from '../providers/map-navigation/map-navigation';
import { AngularFireAuthModule } from 'angularfire2/auth'
import { RepaymentsProvider } from '../providers/repayments/repayments';
import { CustomerProvider } from '../providers/customer/customer';
import { OrderProvider } from '../providers/order/order';
import { ReturnsProvider } from '../providers/returns/returns';
import { PaymentProvider } from '../providers/payment/payment';


import { config } from '../providers/firebase/firebase.config';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage
  ],
  imports: [
    BrowserModule,
    HttpModule,

    LoginPageModule,
    OrdersPageModule,
    ProductsPageModule,
    ProductsPageModule,
    ExpensesPageModule,
    LossesPageModule,
    CreditsPageModule,
    ExpensesListPageModule,
    PaymentPageModule,
    PaymentsTodayPageModule,

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
    ListPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    MapNavigationProvider,
    RepaymentsProvider,
    CustomerProvider,
    OrderProvider,
    ReturnsProvider,
    PaymentProvider
  ]
})
export class AppModule {}
