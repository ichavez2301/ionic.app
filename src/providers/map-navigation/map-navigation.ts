import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular'

/*
  Generated class for the MapNavigationProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class MapNavigationProvider {

  constructor(public platform: Platform) {
    
  }

  open(locate:any) {
    if(this.platform.is("ios")) {
      window.open("maps://?q=" + locate.address, "_system")
    }
    if(this.platform.is("android")) {
      window.open("geo://?q=" + locate.address, '_system')
    }
  }

}
