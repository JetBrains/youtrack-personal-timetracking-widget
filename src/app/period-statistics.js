import './personal-time-tracking-widget.scss';

import React from 'react';
import PropTypes from 'prop-types';
import Link from '@jetbrains/ring-ui/components/link/link';
import Tooltip from '@jetbrains/ring-ui/components/tooltip/tooltip';
import classNames from 'classnames';
import {format as fechaFormat} from 'fecha';
import {i18n} from 'hub-dashboard-addons/dist/localization';

import workTimePresentation from './work-time-presentation';

class PeriodStatistics extends React.Component {

  static propTypes = {
    workItems: PropTypes.array,
    date: PropTypes.number,
    workTimeSettings: PropTypes.object,
    youTrack: PropTypes.object,
    expanded: PropTypes.bool,
    groupByDays: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.state = {
      expanded: props.expanded,
      youTrack: props.youTrack,
      date: props.date,
      workItems: props.workItems,
      workTimeSettings: props.workTimeSettings
    };
  }

  workPeriod(minutes) {
    const workTimeSettings = this.state.workTimeSettings;
    if (!minutes) {
      return '0';
    }
    return workTimePresentation.toPresentation(workTimeSettings, minutes);
  }

  workType(workItem) {
    if (!workItem.type || !workItem.type.name) {
      return 'Working';
    }
    return `${workItem.type.name}`;
  }

  workItemText(workItem) {
    const type = this.workType(workItem);
    const workPeriod = this.workPeriod(workItem.duration.minutes);
    return (
      <Tooltip title={workItem.text}>
        <span>
          {i18n('{{type}} for {{workPeriod}}', {type, workPeriod: ''})}
          <strong>{workPeriod}</strong>
          {
            i18n('{{working}} on {{issueName}}', {working: '', issueName: ''}) // To make translators some context what are these labels about
          }
        </span>
      </Tooltip>
    );
  }

  issueUrl(workItem) {
    const youTrack = this.state.youTrack;
    return `${youTrack.homeUrl}/issue/${workItem.issue.idReadable}`;
  }

  getIssueLinkClassName(workItem, baseClassName) {
    const resolved = workItem.issue &&
      workItem.issue.resolved !== undefined &&
      workItem.issue.resolved !== null;
    return classNames(
      baseClassName, resolved && `${baseClassName}_resolved`
    );
  }

  dateToString(timestamp) {
    const date = new Date(timestamp);
    const localDate = new Date(date.getUTCFullYear(),
      date.getUTCMonth(), date.getUTCDate(),
      0, 0, 0, 0);
    return fechaFormat(localDate, 'ddd D MMM');
  }

  renderWorkItems(workItems) {
    const navigateToIssue = workItem =>
      () => window.open(this.issueUrl(workItem), '_top');

    const trimString = str => {
      const maxAllowedLength = 30;
      const delta = 3;
      return str.length <= (maxAllowedLength + delta)
        ? str
        : `${str.substring(0, maxAllowedLength).trim()}...`;
    };

    return (
      workItems.map(workItem => (
        <div
          key={`work-item-${workItem.id}`}
        >
          <div
            className="personal-time-tracking__work-item"
            onClick={navigateToIssue(workItem)}
          >
            <span>
              {this.workItemText(workItem)}
            </span>
            <Tooltip title={trimString(workItem.issue.summary)}>
              <Link
                pseudo={true}
                target={'_top'}
                className={
                  this.getIssueLinkClassName(workItem, 'issue-id')
                }
                href={this.issueUrl(workItem)}
              >
                {`${workItem.issue.idReadable}`}
              </Link>
            </Tooltip>
          </div>
        </div>
      ))
    );
  }

  renderNoResults(title) {
    return (
      <div>
        <div className="personal-time-tracking__day-header personal-time-tracking__day-header_empty">
          {`${title} (—)`}
        </div>
        <div className="personal-time-tracking__day"/>
      </div>
    );
  }

  title(date) {
    return workTimePresentation.isToday(date) ? i18n('Today')
      : this.dateToString(date);
  }

  render() {
    const {workItems, date} = this.state;

    const title = this.title(date);
    if (!workItems || !workItems.length) {
      return this.renderNoResults(title);
    }
    const total = this.workPeriod(
      workTimePresentation.totalDuration(workItems));

    return (
      <div>
        <div className="personal-time-tracking__day-header">
          {`${title} (${total})`}
        </div>
        <div className="personal-time-tracking__day">
          {this.renderWorkItems(workItems)}
        </div>
      </div>
    );
  }

}

export default PeriodStatistics;
