import React, { PureComponent } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  InteractionManager,
} from 'react-native';
import Icon from './Icon/';

export default class GoBack extends PureComponent {
  render() {
    let { iconPress, onBackPress } = this.props;
    if (!onBackPress) {
      onBackPress = () => {
        // requestAnimationFrame(() => {
        this.props.navigation.goBack();
        // });
      };
    }
    return (
      <TouchableOpacity style={[styles.iconPress, iconPress]} onPress={onBackPress.bind(this)}>
        <Icon name="navigate-go-back" size={20} color="#3a3a3a" style={{ marginLeft: -4 }} />
      </TouchableOpacity>
    );
  }
}
const styles = StyleSheet.create({
  iconPress: {
    width: 40,
    height: 40,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
