import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';

/*
  Generated class for the SessionProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SessionProvider {
  public CurrentUser;

  constructor(private afa: AngularFireAuth) {
    this.CurrentUser = this.afa.auth.currentUser  
  }

  public async exists() {
    return new Promise((resolve, reject) => {
      this.afa.auth.onAuthStateChanged((user) => {
        if(!user) 
          resolve(false)
        else {
          this.CurrentUser = user
          resolve(true)
        }
      });
    });
  }
  
}
