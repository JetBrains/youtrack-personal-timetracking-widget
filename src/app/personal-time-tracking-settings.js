import React from 'react';
import PropTypes from 'prop-types';
import Panel from '@jetbrains/ring-ui/components/panel/panel';
import Button from '@jetbrains/ring-ui/components/button/button';
import {i18n} from 'hub-dashboard-addons/dist/localization';
import ServiceSelect from '@jetbrains/hub-widget-ui/dist/service-select';

import {responseErrorMessage} from './components/response-error-message';

import './components/widget-form.scss';

class PersonalTimeTrackingWidget extends React.Component {

  static propTypes = {
    youTrack: PropTypes.object,
    youTracks: PropTypes.array,
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func,
    onTestConnection: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      youTrack: props.youTrack,
      youTracks: props.youTracks,
      isConnectionError: false,
      isLoading: false
    };
  }

  componentDidMount() {
    this.changeYouTrack(this.state.youTrack);
  }

  componentWillReceiveProps(props) {
    if (props.youTracks) {
      this.setState({
        youTracks: props.youTracks
      });
    }
    if (props.youTrack) {
      this.changeYouTrack(props.youTrack);
    }
  }

  onSubmitConfigurationForm = async () => {
    this.setState({isLoading: true});
    await this.props.onSubmit(this.state.youTrack);
    this.setState({isLoading: false});
  };

  changeYouTrack = async youTrack => {
    this.setState({youTrack});
    try {
      await this.props.onTestConnection(youTrack);
      this.setState({
        isConnectionError: false,
        connectionError: ''
      });
    } catch (err) {
      const connectionError = responseErrorMessage(
        err, i18n('Cannot connect to selected YouTrack')
      );
      this.setState({
        isConnectionError: true,
        connectionError
      });
    }
  };

  render() {
    return (
      <div className="ring-form">
        {
          (this.state.youTracks || []).length > 1 &&
          <ServiceSelect
            placeholder={i18n('Select YouTrack')}
            selectedService={this.state.youTrack}
            serviceList={this.state.youTracks}
            onServiceSelect={this.changeYouTrack}
          />
        }
        <Panel className="widget-form__footer">
          {
            this.state.isConnectionError &&
            <div className="widget-form__footer-error">
              { this.state.connectionError }
            </div>
          }
          <Button
            blue={true}
            loader={this.state.isLoading}
            disabled={this.state.isConnectionError}
            onClick={this.onSubmitConfigurationForm}
          >
            { i18n('Save') }
          </Button>
          <Button
            onClick={this.props.onCancel}
            loader={this.state.isLoading}
          >
            { i18n('Cancel') }
          </Button>
        </Panel>
      </div>
    );
  }
}

export default PersonalTimeTrackingWidget;
