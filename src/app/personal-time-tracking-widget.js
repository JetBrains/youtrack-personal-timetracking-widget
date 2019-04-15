/* eslint-disable no-magic-numbers */
import './personal-time-tracking-widget.scss';

import React from 'react';
import PropTypes from 'prop-types';
import LoaderInline from '@jetbrains/ring-ui/components/loader-inline/loader-inline';
import Link from '@jetbrains/ring-ui/components/link/link';
import {i18n} from 'hub-dashboard-addons/dist/localization';

import ServiceResource from './components/service-resource';
import {
  myWorkItems, workTimeSettings as workTimeSettingsLoader
} from './resources';
import PeriodStatistics from './period-statistics';
import workTimePresentation from './work-time-presentation';
import PersonalTimeTrackingSettings from './personal-time-tracking-settings';

const MIN_YT_VERSION = '2018.2.45514';

class PersonalTimeTrackingWidget extends React.Component {

  static propTypes = {
    dashboardApi: PropTypes.object,
    registerWidgetApi: PropTypes.func
  };

  constructor(props) {
    super(props);
    const {dashboardApi} = props;

    this.state = {
      isLoading: true,
      isLoadingMore: false,
      isConfiguring: false
    };

    dashboardApi.setTitle(i18n('Personal Time Tracking'));
  }

  componentDidMount() {
    this.initialize();
    const millisInSec = 1000;
    setInterval(async () => {
      const {isConfiguring, isLoading, isLoadingMore} = this.state;
      if (!isConfiguring && !isLoading && !isLoadingMore) {
        await this.refresh();
      }
    }, 5 * 60 * millisInSec);
  }

  weekPeriod(startWeek, numberOfWeeks) {
    function atMidnight(date) {
      date.setHours(0, 0, 0, 0);
    }

    const startDay = new Date();
    startDay.setDate(startDay.getDate() - 7 * startWeek);
    atMidnight(startDay);

    const someWeeksAgo = new Date();
    someWeeksAgo.setDate(someWeeksAgo.getDate() - (7 * numberOfWeeks));
    atMidnight(someWeeksAgo);

    const period = [];

    let i = new Date(someWeeksAgo.getTime());
    while (i.getTime() < startDay.getTime()) {
      const clone = new Date(i.getTime());
      clone.setDate(i.getDate() + 1);
      period.push(clone);
      i = clone;
    }

    return period;
  }

  async refresh() {
    this.setState({isLoading: true});
    const numberOfWeeksToShow = 1;
    const numberOfWeeksLoaded = 0;
    const fetcher = this.fetcher();

    const workTimeSettings = await workTimeSettingsLoader(fetcher);
    this.setState({
      workTimeSettings,
      numberOfWeeksToShow,
      numberOfWeeksLoaded,
      workItems: []
    }, async () => {
      await this.loadMoreWorkItems();
      this.setState({
        isLoading: false
      });
    });
  }

  async loadMoreWorkItems() {
    const {numberOfWeeksLoaded, workTimeSettings, workItems} = this.state;

    const fetcher = this.fetcher();

    const period = this.weekPeriod(numberOfWeeksLoaded,
      numberOfWeeksLoaded + 6, workTimeSettings.workDays);

    const loadedWorkItems = (await myWorkItems(
      fetcher,
      workTimePresentation.toUTC0(period[0]),
      workTimePresentation.toUTC0(period[period.length - 1])
    ));
    const newWorkItems = (workItems || []).concat(loadedWorkItems);
    this.setState({
      numberOfWeeksLoaded: numberOfWeeksLoaded + 6,
      workItems: newWorkItems
    });
  }

  workPeriod(minutes) {
    const workTimeSettings = this.state.workTimeSettings;
    return workTimePresentation.toPresentation(workTimeSettings, minutes);
  }

  fetchYouTrack = async (url, params) => {
    const {dashboardApi} = this.props;
    const {youTrack} = this.state;
    return await dashboardApi.fetch(youTrack.id, url, params);
  };

  fetcher = optionalYouTrack => {
    const youTrack = optionalYouTrack || this.state.youTrack;
    const {dashboardApi} = this.props;
    return (url, params) => dashboardApi.fetch(youTrack.id, url, params);
  };

  initialize = async () => {
    const {registerWidgetApi, dashboardApi} = this.props;
    this.setState({isLoading: true});

    const config = await dashboardApi.readConfig();
    const isNew = !config;

    const configYouTrack = config && config.youTrack;
    const youTracks = await ServiceResource.getYouTrackServices(
      dashboardApi.fetchHub.bind(dashboardApi),
      MIN_YT_VERSION
    );

    const canChangeYouTrack = youTracks.length > 1;
    const isConfiguring = isNew && canChangeYouTrack;

    if (isConfiguring) {
      dashboardApi.enterConfigMode();
    }
    registerWidgetApi(this.getWidgetApi(canChangeYouTrack));

    this.setState(
      {
        youTrack: configYouTrack || youTracks[0],
        youTracks,
        isConfiguring,
        isNew,
        isLoading: !isConfiguring
      },
      async () => !isConfiguring && await this.refresh()
    );
  };

  getWidgetApi = canChangeYouTrack => {
    const api = {
      onRefresh: async () => this.refresh()
    };
    if (canChangeYouTrack) {
      api.onConfigure = () => this.setState({
        isConfiguring: true
      });
    }
    return api;
  };

  onCancelConfigurationForm = async () => {
    if (this.state.isNew) {
      await this.props.dashboardApi.removeWidget();
    } else {
      this.setState({isConfiguring: false, isLoading: true});
      await this.props.dashboardApi.exitConfigMode();
      await this.refresh();
    }
  };

  onSubmitConfigurationForm = async youTrack => {
    await this.props.dashboardApi.storeConfig({
      youTrack: {
        id: youTrack.id,
        homeUrl: youTrack.homeUrl,
        name: youTrack.name
      }
    });
    await this.props.dashboardApi.exitConfigMode();
    this.setState(
      {isConfiguring: false, isLoading: true, youTrack},
      async () => await this.refresh()
    );
  };

  incrementWeeksToShow = async () => {
    const {
      numberOfWeeksToShow,
      numberOfWeeksLoaded
    } = this.state;

    if (numberOfWeeksToShow === numberOfWeeksLoaded) {
      this.setState({
        isLoadingMore: true
      });
      await this.loadMoreWorkItems();
    }

    this.setState({
      numberOfWeeksToShow: numberOfWeeksToShow + 1,
      isLoadingMore: false
    });
  };

  renderLoader() {
    return (
      <LoaderInline/>
    );
  }

  renderConfigurationForm() {
    const onTestConnection = async youTrack =>
      await workTimeSettingsLoader(this.fetcher(youTrack));

    return (
      <PersonalTimeTrackingSettings
        youTrack={this.state.youTrack}
        youTracks={this.state.youTracks}
        onSubmit={this.onSubmitConfigurationForm}
        onCancel={this.onCancelConfigurationForm}
        onTestConnection={onTestConnection}
      />
    );
  }

  renderWidgetBody() {
    const {
      workItems, youTrack, workTimeSettings, numberOfWeeksToShow, isLoadingMore
    } = this.state;

    const showPeriod = this.weekPeriod(0, numberOfWeeksToShow,
      workTimeSettings.workDays);

    const filteredWorkItems = (workItems || []).filter(
      workItem =>
        workItem.date >= workTimePresentation.toUTC0(showPeriod[0]) &&
        workItem.date <= workTimePresentation.toUTC0(
          showPeriod[showPeriod.length - 1])
    );

    const total = this.workPeriod(
      workTimePresentation.totalDuration(filteredWorkItems)
    );
    const title = numberOfWeeksToShow === 1
      ? i18n('Total spent time for this week')
      : i18n('Total spent time for {{numberOfWeeksToShow}} weeks', {numberOfWeeksToShow});

    const groupBy = (xs, key) => xs.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});

    const byDates = groupBy(filteredWorkItems, 'date');

    const dates = Object.keys(byDates).map(it => parseInt(it, 10));
    showPeriod.forEach(date => {
      const utcTimestamp = workTimePresentation.toUTC0(date);
      if (dates.indexOf(utcTimestamp) === -1) {
        dates.push(utcTimestamp);
      }
    });
    return (
      <div className="personal-time-tracking">
        <div className="personal-time-tracking__work-items">
          {
            dates.sort().reverse().map(date => (
              <PeriodStatistics
                key={date}
                workItems={byDates[date]}
                youTrack={youTrack}
                workTimeSettings={workTimeSettings}
                date={date}
              />
            ))
          }
          {isLoadingMore && <LoaderInline/>}
          <div
            className="personal-time-tracking__load-more"
            onClick={this.incrementWeeksToShow}
          >
            <Link pseudo={true}>
              {i18n('Show one more week')}
            </Link>
          </div>
        </div>
        <div className="personal-time-tracking__total">
          <div className="personal-time-tracking__total-title">
            {title}
          </div>
          <div className="personal-time-tracking__total-value">
            {total}
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {
      isLoading,
      isConfiguring
    } = this.state;

    if (isLoading) {
      return this.renderLoader();
    }
    if (isConfiguring) {
      return this.renderConfigurationForm();
    }
    return this.renderWidgetBody();
  }


}

export default PersonalTimeTrackingWidget;
