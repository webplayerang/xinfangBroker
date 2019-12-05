import React, { PureComponent } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import PropTypes from 'prop-types';

import Icon from '../components/Icon/';

const status = {
  'no-data-found': '暂无数据',
  'request-failed': '服务请求失败\n请稍后再试',
  'network-error': '当前网络异常\n请检查您的网络',
};

export default class StatusView extends PureComponent {
  static propTypes = {
    status: PropTypes.string,
    indicatorStyle: PropTypes.string,
  };

  static defaultProps = {
    status: '',
    indicatorStyle: null,
  };

  render () {
    if (!this.props.status) {
      return (
        <ActivityIndicator
          style={[{ height: 40, backgroundColor: 'transparent', transform: [{ scale: 1.2 }] }, this.props.indicatorStyle]}
          size="small"
          color="#ccc"
          animating
        />
      );
    }
    return (
      <View style={styles.errorWrapper}>
        <Icon name={this.props.status} size={60} color="#d6d7da" />
        <Text style={styles.errorText}>{status[this.props.status]}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  errorWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    flex: 1,
  },
  errorText: {
    color: '#d6d7da',
    textAlign: 'center',
    lineHeight: 20,
  },
});
