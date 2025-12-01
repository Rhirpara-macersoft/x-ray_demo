import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Account, Campaign } from '../models/account.model';
import { ApiPath } from './api-path.service';
import { Util, FormatValue } from '../utils/util';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  constructor(private http: HttpClient) {}

  getCampaign(account: Account, organizationId: string): Observable<Campaign[] | null> {
    // Validation checks
    if (FormatValue.isNull(account)) {
      console.warn('Account is null or undefined');
      return of(null);
    }

    if (FormatValue.emptyString(account.id)) {
      console.warn('Account ID is empty');
      return of(null);
    }

    const tokenValue: string = account.token.value;
    if (FormatValue.emptyString(tokenValue)) {
      console.warn('Token value is empty');
      return of(null);
    }

    // Get headers with authorization token
    const headers = Util.getHttpHeaders(tokenValue);

    // Make API call - X-Ray interceptor will automatically trace this
    return this.http.get<Campaign[]>(
      ApiPath.getCampaigns(organizationId),
      { headers }
    );
  }
}
