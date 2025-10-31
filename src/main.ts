import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { inject } from '@vercel/analytics';

import { AppModule } from './app/app.module';
import { injectSpeedInsights } from '@vercel/speed-insights';

injectSpeedInsights();
inject();

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
