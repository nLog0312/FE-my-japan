import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false,
})
export class DashboardComponent implements OnInit {
  constructor(
    private readonly auth: AuthService,
  ) { }

  currentUser: any;
  now = new Date();

  ngOnInit() {
    this.auth.user$.subscribe(user => {
      this.currentUser = user;
    });
  }


// Mock state – replace with your real data services
balance = 6500000;
momChange = 43; // month-over-month %
income = 15000000;
expense = 8500000;


regularHours = 168;
overtimeHours = 12;
get totalHours() { return this.regularHours + this.overtimeHours; }


expectedSalary = 12000000;


spendRate = 0.567; // 0..1 for ion-progress-bar


tasks = [
{ title: 'Chốt báo cáo tuần', done: false, tag: 'ưu tiên' },
{ title: 'Theo dõi khoản chi ngày 12', done: true },
{ title: 'Cập nhật KPI tháng', done: false },
];
get pendingTasks() { return this.tasks.filter(t => !t.done).length; }


openSettings() { /* route to settings or present modal */ }
}
