import React, { PureComponent } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import BaseStyles from '../../style/BaseStyles';

export default class headerTitle extends PureComponent {
  render() {
    const { params = {} } = this.props;
    return (
      <TouchableOpacity
        style={styles.headerTitle}
        onPress={() => {
          params.filterViewShow();
        }}
      >
        <Text style={BaseStyles.headerTitleText}>
          {params.defaultTitle}
        </Text>
        {
          params.triangleDirection ?
            <View style={[BaseStyles.triangleUp, { marginLeft: 5 }]} />
            :
            <View style={[BaseStyles.triangleDown, { marginLeft: 5 }]} />
        }
      </TouchableOpacity >
    );
  }
}
const styles = StyleSheet.create({
  headerTitle: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
