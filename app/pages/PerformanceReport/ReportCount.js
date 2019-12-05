import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, InteractionManager, DeviceEventEmitter } from 'react-native';
import axios from 'axios';
import { screen } from '../../utils';

export default class ReportCount extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      resultData: {},
    };
  }
  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.requestCount();
    });
    this.listener = DeviceEventEmitter.addListener(this.props.refresh, (params) => {
      this.requestCount();
    });
    this.timer = setInterval(
      () => {
        this.requestCount();
      },
      5000,
    );
  }

  componentWillUnmount() {
    this.timer && clearInterval(this.timer);
  }

  requestCount() {
    const params = this.props.params;
    axios.get('/companyStatistics/getReservationCount', {
      params,
    })
      .then((res) => {
        if (res.data.status === 'C0000') {
          const resultData = res.data.result;
          this.setState({
            resultData,
          });
        }
      })
      .catch(() => { });
  }

  render() {
    return (
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.boxItem}>
          <Text style={styles.itemTitle}>报备量</Text>
          <Text style={styles.itemValue}>{this.state.resultData.reservationCount}</Text>
        </View>
        <View style={styles.boxItem}>
          <Text style={styles.itemTitle}>带看量</Text>
          <Text style={styles.itemValue}>{this.state.resultData.guideCount}</Text>
        </View>
      </View>);
  }
}

const styles = StyleSheet.create({
  boxItem: {
    paddingVertical: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    width: screen.width / 3,
    height: 80,
    borderRightColor: '#e7e8ea',
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  itemTitle: {
    color: '#a8a8a8',
    fontSize: 14,
  },
  itemValue: {
    color: '#3a3a3a',
    fontSize: 18,
  },
});
