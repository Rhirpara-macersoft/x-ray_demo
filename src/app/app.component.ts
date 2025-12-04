import { Component, OnInit } from '@angular/core';
import { ClientTiming, XRayTracingService } from './services/xray-tracing.service';
import { CampaignService } from './services/campaign.service';
import { Account } from './models/account.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  isError : any;
  tokenInput = localStorage.getItem('userToken') || '';

  loggedInUserDetail: Account = {
    id: '606b5941-42f0-40bf-b6f6-4b72ea2f3734',
    token: {
      value: ''   // <-- dynamic token coming from user
    }
  };

  organizationId = '606b5941-42f0-40bf-b6f6-4b72ea2f3734';

  constructor(
    private xrayService: XRayTracingService,
    private campaignService: CampaignService
  ) {}

  ngOnInit(): void {
    // Load token from localStorage on page refresh
    if (this.tokenInput) {
      this.loggedInUserDetail.token.value = this.tokenInput;
    }
  }

  saveToken() {
    localStorage.setItem('userToken', this.tokenInput);
    this.loggedInUserDetail.token.value = this.tokenInput;

    console.log("Token saved:", this.tokenInput);
  }

  campaignsGrid(): void {
    this.campaignService.getCampaign(
      this.loggedInUserDetail,
      this.organizationId
    ).subscribe({
      next: (res) => {
        console.log("API Response:", res);
      },
      error: (err) => {
        console.error("API Error:", err);
        if (err.status === 0) {
          this.isError = 'Unable to connect to the server. This may be due to CORS configuration issues or network problems.';
        } else {
          this.isError = err?.error?.message ||
                          err?.message ||
                          `Error ${err.status}: ${err.statusText || 'An unexpected error occurred'}`;
        }
      }
    });
  }

  apiCall() {
    this.campaignsGrid();
  }
}
