import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tenantStatus',
})
export class TenantStatusPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
