import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Tenant {

  getTenantSubdomain(): string | null {
    const hostname = window.location.hostname; 
    const parts = hostname.split('.');

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return null;
    }

    if (parts.length >= 3) {
      const subdomain = parts[0];
        if (subdomain !== 'www' && subdomain !== 'app' && subdomain !== 'admin') {
        return subdomain;
      }
    }

    return null;
  }
}