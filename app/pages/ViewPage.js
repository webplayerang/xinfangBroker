import React from 'react';
import { WebView } from 'react-native';
import { screen } from '../utils';

export default class ViewPage extends React.Component {
  static navigationOptions = () => ({
    title: '',
  });

  render() {
    return (
      <WebView source={{ uri: this.props.navigation.state.params.url }} style={{ width: screen.width, height: screen.height }} />
    );
  }
}

