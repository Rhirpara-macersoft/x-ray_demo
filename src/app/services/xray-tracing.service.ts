import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface TraceData {
  traceId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  url: string;
  status?: number;
  error?: string;
}

export interface ClientTiming {
  // Question 1: Load balancer arrival time (approximated by request start)
  loadBalancerArrival: number;

  // Question 2: Server handoff (approximated by connection established)
  serverHandoff: number;

  // Question 3: Application bootstrap time
  applicationLoad: number;

  // Question 4: Page start to load (DOM Content Loaded)
  pageLoadStart: number;

  // Question 5 & 6: API calls and their durations
  apiCalls: Array<{
    url: string;
    startTime: number;
    duration: number;
    status: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class XRayTracingService {
  private traces: Map<string, TraceData> = new Map();
  private clientTimings: ClientTiming;
  private apiBeaconUrl = '/api/trace-beacon'; // Your backend endpoint

  constructor(private http: HttpClient) {
    // Initialize with default values first
    this.clientTimings = {
      loadBalancerArrival: 0,
      serverHandoff: 0,
      applicationLoad: 0,
      pageLoadStart: 0,
      apiCalls: []
    };

    // Then populate with actual timing data
    this.initializeClientTimings();
  }

  // Generate AWS X-Ray compatible trace ID
  generateTraceId(): string {
    // Format: Root=1-<8hex epoch>-<24hex random>;Sampled=1
    const epochHex = Math.floor(Date.now() / 1000).toString(16);
    const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(12)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return `Root=1-${epochHex}-${randomHex};Sampled=1`;
  }

  // Initialize client-side performance timings
  private initializeClientTimings(): void {
    // Check if performance timing is available
    if (!performance || !performance.timing) {
      console.warn('Performance timing API not available');
      return;
    }

    const perfData = performance.timing;

    this.clientTimings = {
      // Q1: When request lands on load balancer (request start)
      loadBalancerArrival: perfData.requestStart - perfData.navigationStart,

      // Q2: Server handoff (when connection established)
      serverHandoff: perfData.connectEnd - perfData.navigationStart,

      // Q3: Application tagged to load (response received + processing)
      applicationLoad: perfData.responseEnd - perfData.navigationStart,

      // Q4: Page starts to load (DOM parsing begins)
      pageLoadStart: perfData.domLoading - perfData.navigationStart,

      // Q5 & Q6: API calls tracked separately
      apiCalls: []
    };

    // Send initial page load timings to backend
    this.sendClientTimings();
  }

  // Start tracking a trace
  startTrace(url: string, traceId: string, startTime: number): void {
    this.traces.set(url, {
      traceId,
      startTime,
      url
    });
  }

  // End tracking and record results
  endTrace(url: string, data: Partial<TraceData>): void {
    const trace = this.traces.get(url);
    if (trace) {
      const completeTrace = {
        ...trace,
        ...data,
        endTime: performance.now()
      };

      // Q5 & Q6: Record API call and duration
      this.clientTimings.apiCalls.push({
        url: url,
        startTime: trace.startTime,
        duration: data.duration || 0,
        status: data.status || 0
      });

      // Send trace data to backend for X-Ray integration
      this.sendTraceToBackend(completeTrace);

      this.traces.delete(url);
    }
  }

  // Send trace data to backend
  private sendTraceToBackend(trace: TraceData): void {
    // Send as beacon (non-blocking)
    const payload = JSON.stringify({
      trace,
      clientTimings: this.clientTimings
    });

    // Use sendBeacon for reliability (works even on page unload)
    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.apiBeaconUrl, payload);
    } else {
      // Fallback to regular POST
      this.http.post(this.apiBeaconUrl, payload).subscribe({
        error: (err) => console.error('Failed to send trace:', err)
      });
    }
  }

  // Send client timings to backend
  private sendClientTimings(): void {
    // Wait for page load to complete
    if (document.readyState === 'complete') {
      this.performSendClientTimings();
    } else {
      window.addEventListener('load', () => {
        this.performSendClientTimings();
      });
    }
  }

  private performSendClientTimings(): void {
    const payload = {
      timings: this.clientTimings,
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    };

    this.http.post(`${this.apiBeaconUrl}/client-timings`, payload).subscribe({
      error: (err) => console.error('Failed to send client timings:', err)
    });
  }

  // Get current traces (for debugging)
  getCurrentTraces(): TraceData[] {
    return Array.from(this.traces.values());
  }

  // Get client timings (for debugging)
  getClientTimings(): ClientTiming {
    return this.clientTimings;
  }
}
