import { Injectable } from '@angular/core';

/*
  Generated class for the RoutesProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class RoutesProvider {

  constructor() {
  }

  public static routes = [
    {
      id: 1,
      name: "Ruta 1"
    },
    {
      id: 2,
      name: "Ruta 2"
    },
    {
      id: 3,
      name: "Ruta 3"
    },
    {
      id: 4,
      name: "Ruta 4"
    },
    {
      id: 5,
      name: "Ruta 5"
    },
    {
      id: 6,
      name: "Ruta 6"
    },
    {
      id: 7,
      name: "Ruta 7"
    }
  ]

}
