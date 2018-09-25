import React from 'react';
import PropTypes from 'prop-types';
import {i18n} from 'hub-dashboard-addons/dist/localization';
import ServiceSelect from '@jetbrains/hub-widget-ui/dist/service-select';
import ConfigurationForm from '@jetbrains/hub-widget-ui/dist/configuration-form';
import HttpErrorHandler from '@jetbrains/hub-widget-ui/dist/http-error-handler';

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
      const connectionError = HttpErrorHandler.getMessage(
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
      <ConfigurationForm
        warning={this.state.isConnectionError ? this.state.connectionError : ''}
        isInvalid={this.state.isConnectionError}
        isLoading={this.state.isLoading}
        onSave={this.onSubmitConfigurationForm}
        onCancel={this.props.onCancel}
      >
        <ServiceSelect
          placeholder={i18n('Select YouTrack')}
          selectedService={this.state.youTrack}
          serviceList={this.state.youTracks}
          onServiceSelect={this.changeYouTrack}
        />
      </ConfigurationForm>
    );
  }
}

export default PersonalTimeTrackingWidget;
