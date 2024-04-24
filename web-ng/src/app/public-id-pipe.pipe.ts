import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'publicIdPipe',
  standalone: true
})
export class PublicIdPipePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
