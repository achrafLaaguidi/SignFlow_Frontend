import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy, inject } from '@angular/core';

import { SuperAdmin } from '../../services/super-admin';
import { ToastrService } from 'ngx-toastr';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('signatureChart') signatureChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('tenantChart') tenantChartCanvas!: ElementRef<HTMLCanvasElement>;

  signatureChartInstance?: Chart;
  tenantChartInstance?: Chart;

  private superAdminService = inject(SuperAdmin);
  private toastr = inject(ToastrService);

  metrics = [
    { label: 'Total Tenants', value: '0', icon: 'fas fa-building', iconClass: 'bg-blue-100 text-blue-600', trend: 0, trendClass: 'text-green-600' },
    { label: 'Active Users', value: '0', icon: 'fas fa-users', iconClass: 'bg-green-100 text-green-600', trend: 0, trendClass: 'text-green-600' },
    { label: 'Total Signatures', value: '0', icon: 'fas fa-file-signature', iconClass: 'bg-purple-100 text-purple-600', trend: 0, trendClass: 'text-red-600' },
    { label: 'Pending Documents', value: '0', icon: 'fas fa-clock', iconClass: 'bg-yellow-100 text-yellow-600', trend: 0, trendClass: 'text-green-600' }
  ];

  ngOnInit(): void {
    this.loadMetrics();
  }

  ngAfterViewInit(): void {
    this.initCharts();
  }

  ngOnDestroy(): void {
    this.signatureChartInstance?.destroy();
    this.tenantChartInstance?.destroy();
  }

  loadMetrics(): void {
    this.superAdminService.getPlatformMetrics().subscribe({
      next: (data: any) => {
        this.metrics = [
          { label: 'Total Tenants', value: data.totalTenants ?? '156', icon: 'fas fa-building', iconClass: 'bg-blue-100 text-blue-600', trend: data.tenantsTrend ?? 12, trendClass: 'text-green-600' },
          { label: 'Active Users', value: data.activeUsers ?? '2,431', icon: 'fas fa-users', iconClass: 'bg-green-100 text-green-600', trend: data.usersTrend ?? 8, trendClass: 'text-green-600' },
          { label: 'Total Signatures', value: data.totalSignatures ?? '14,892', icon: 'fas fa-file-signature', iconClass: 'bg-purple-100 text-purple-600', trend: data.signaturesTrend ?? -3, trendClass: 'text-red-600' },
          { label: 'Pending Documents', value: data.pendingDocuments ?? '342', icon: 'fas fa-clock', iconClass: 'bg-yellow-100 text-yellow-600', trend: data.pendingTrend ?? 5, trendClass: 'text-green-600' }
        ];

        if (data.chartMonthlySignatures && this.signatureChartInstance) {
          this.signatureChartInstance.data.datasets[0].data = data.chartMonthlySignatures;
          this.signatureChartInstance.update();
        }

        if (data.chartTenantDistribution && this.tenantChartInstance) {
          this.tenantChartInstance.data.datasets[0].data = data.chartTenantDistribution;
          this.tenantChartInstance.update();
        }
      },
      error: (error) => {
        // 🟢 استبدال الـ console بـ Toast Notification
        this.toastr.error('Failed to load platform metrics. Please try again later.', 'Error');
      }
    });
  }

  initCharts(): void {
    this.signatureChartInstance = new Chart(this.signatureChartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Signatures',
          data: [1200, 1900, 3000, 2500, 3200, 4100],
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.08)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#2563eb'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: 'rgba(241, 245, 249, 1)' } }
        }
      }
    });

    this.tenantChartInstance = new Chart(this.tenantChartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Active', 'Suspended', 'Inactive'],
        datasets: [{
          data: [120, 20, 16],
          backgroundColor: ['#16a34a', '#ca8a04', '#dc2626'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, font: { size: 12 } }
          }
        },
        cutout: '75%'
      }
    });
  }
}