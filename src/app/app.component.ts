import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
// import { CreditsPage } from '../pages/credits/credits';
import { AngularFireAuth } from 'angularfire2/auth'
import { LoginPage } from '../pages/login/login';
import { ExpensesListPage } from '../pages/expenses-list/expenses-list'


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;
  pages: Array<{title: string, component: any, icon: string}>;

  constructor(
    public platform: Platform, 
    public statusBar: StatusBar, 
    public splashScreen: SplashScreen, 
    public afa: AngularFireAuth) {

    this.initializeApp();
    
    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Clientes', component: HomePage, icon: 'contact' },
      //{ title: 'Notas de credito', component: CreditsPage, icon: 'calculator' },
      { title: 'Gastos', component: ExpensesListPage, icon: 'exit' }
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.afa.auth.onAuthStateChanged(res => {
        if(res == null) {
           this.nav.setRoot(LoginPage);
        }
      })

      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  signOut() {
    this.afa.auth.signOut().then(() => {
      this.nav.setRoot(LoginPage)
    })
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
