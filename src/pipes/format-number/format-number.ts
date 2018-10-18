import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the FormatNumberPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'formatNumber',
})
export class FormatNumberPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: string, ...args) {
    if(!args) 
      return parseFloat(value).toFixed(2)
      
    return parseFloat(value).toFixed(args[0])
  }
}
