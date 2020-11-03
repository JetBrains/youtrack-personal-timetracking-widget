import 'babel-polyfill';
import 'hub-dashboard-addons/dashboard.css';

import React from 'react';
import {render} from 'react-dom';
import DashboardAddons from 'hub-dashboard-addons';

import PersonalTimeTrackingWidget from './personal-time-tracking-widget';
import {initTranslations} from './translations';

DashboardAddons.registerWidget(async (dashboardApi, registerWidgetApi) => {
  initTranslations(DashboardAddons.locale);

  return render(
    <PersonalTimeTrackingWidget
      dashboardApi={dashboardApi}
      registerWidgetApi={registerWidgetApi}
    />,
    document.getElementById('app-container')
  );
});
