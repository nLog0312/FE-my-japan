import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  private readonly sub = this.auth.initGlobalLogoutHandler();
  constructor(private readonly auth: AuthService) {}

  async ngOnInit() {
    await this.auth.initFromStorage();
  }
  ngOnDestroy() { this.sub.unsubscribe(); }
}
