import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

 import { HomePage } from '../home/home'

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  email: string = ''
  password: string = ''
  

  constructor(public navCtrl: NavController, public navParams: NavParams, private afa: AngularFireAuth) {
  }

  async signIn() {
    this.afa.auth.signInWithEmailAndPassword(this.email, this.password)
    .then((user) => {
      this.navCtrl.setRoot(HomePage)
    })
    .catch((err) => {
      alert("Usuario y/o contraseña incorrecta!!")
    })
  }

}
