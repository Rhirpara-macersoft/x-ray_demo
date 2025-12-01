import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiPath {
  static getBaseUrl(): string {
    // Replace with your actual base URL from environment
    return environment.apiBaseUrl || 'https://6op50ujgu6.execute-api.us-east-1.amazonaws.com/dev';
  }

  static getCampaigns(accountId: string): string {
    return ApiPath.getBaseUrl() + `${accountId}/campaigns`;
  }
}
