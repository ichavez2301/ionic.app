import { Injectable } from '@angular/core';

/*
  Generated class for the ProductsProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
export class Product {
  public id?: Number;
  public name: String;
  public category: String;
  public  price: number;
  public qty: number;
}

@Injectable()
export class ProductsProvider {

  constructor() {}

}
