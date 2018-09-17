import React from 'react';
import PropTypes from 'prop-types';
import Select from '@jetbrains/ring-ui/components/select/select';
import {Size as InputSize} from '@jetbrains/ring-ui/components/input/input';
import {i18n} from 'hub-dashboard-addons/dist/localization';

class YouTrackSelector extends React.Component {
  static propTypes = {
    youTracks: PropTypes.array,
    selectedYouTrack: PropTypes.object,
    onChange: PropTypes.func
  };

  static youTrackToSelectItem = it => it && {
    key: it.id,
    label: it.name,
    description: it.homeUrl,
    model: it
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedYouTrack: props.selectedYouTrack
    };
  }

  componentWillReceiveProps(props) {
    this.setState({selectedYouTrack: props.selectedYouTrack});
  }

  changeYouTrack = selectOption => {
    const selectedYouTrack = selectOption.model;
    this.setState({selectedYouTrack});
    this.props.onChange(selectedYouTrack);
  };

  render() {
    const {youTracks} = this.props;
    const {selectedYouTrack} = this.state;

    if (youTracks.length <= 1) {
      return <div/>;
    }

    return (
      <Select
        data={youTracks.map(YouTrackSelector.youTrackToSelectItem)}
        selected={YouTrackSelector.youTrackToSelectItem(selectedYouTrack)}
        onSelect={this.changeYouTrack}
        filter={true}
        label={i18n('Select YouTrack')}
        size={InputSize.FULL}
      />
    );
  }
}

export default YouTrackSelector;
