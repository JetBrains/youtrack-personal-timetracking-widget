import 'babel-polyfill';
import React from 'react';

import Widget from '../app/personal-time-tracking-widget';

describe('PersonalTimeTrackingWidget', () => {

  it('should export PersonalTimeTrackingWidget', () => {
    (Widget).should.be.a('function');
  });
});
