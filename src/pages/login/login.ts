import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore'

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

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    private afa: AngularFireAuth, 
    public loadingCtrl: LoadingController,
    private afs: AngularFirestore) {
  }

  async signIn() {
    let loading = this.loadingCtrl.create({content: 'Espere porfavor...'})
    loading.present();

    this.afa.auth.signInWithEmailAndPassword(this.email, this.password)
    .then((user) => {

      this.afs.collection("employees").ref.where("uid", "==", this.afa.auth.currentUser.uid)
      .get()
      .then((res) => {
        loading.dismiss()
        if(res.docChanges.length > 0) {
          let myuser = res.docChanges[0].doc.data()
          if(myuser.status == 'active') {
            this.navCtrl.setRoot(HomePage)
          } else {
            alert("El usuario ha sido bloqueado por un administrador")
          }
        } else {
          alert("El usuario no existe")
        }
      })
    })
    .catch((err) => {
      loading.dismiss()
      alert("Usuario y/o contraseña incorrecta!!")
    })
  }

}
