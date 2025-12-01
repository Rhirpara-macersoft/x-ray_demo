import { HttpHeaders } from '@angular/common/http';

export class Util {
  static getHttpHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}

export class FormatValue {
  static isNull(value: any): boolean {
    return value === null || value === undefined;
  }

  static emptyString(value: string): boolean {
    return !value || value.trim().length === 0;
  }
}
