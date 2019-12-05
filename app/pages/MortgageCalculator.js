import React, { PureComponent } from 'react';
// import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  Text,
  WebView,
} from 'react-native';
import GoBack from '../components/GoBack';

export default class MortgageCalculator extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: '房贷计算器',
    headerRight: (
      <Text />
    ),
    headerLeft: (
      <GoBack
        navigation={navigation}
      />
    ),
  })

  render() {
    return (
      <View style={styles.container}>
        <WebView source={{ uri: 'http://wx.zencent.com.cn/calc-form-page.html?source=xdt' }} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

});
