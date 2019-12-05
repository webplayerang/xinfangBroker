import React, { PureComponent } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Echarts from 'native-echarts';
import { screen } from '../../utils/index';

export default class FunnelChart extends PureComponent {
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.titleWrapper}>
          <View style={styles.flag} />
          <View style={styles.header}>
            <Text style={styles.title}>转化率</Text>
          </View>
        </View>
        <Echarts
          option={this.props.option}
          height={275}
          width={screen.width}
        />
        <View style={styles.lineWrapper}>
          <View style={styles.line}>
            <View style={[styles.dot, { backgroundColor: '#62cdff' }]} />
            <Text style={styles.deepText}>{this.props.bottomTitle.baobei}</Text>
          </View>
          <View style={styles.line}>
            <View style={[styles.dot, { backgroundColor: '#4dd5a3' }]} />
            <Text style={styles.deepText}>{this.props.bottomTitle.bbzdk}</Text>
          </View>
          <View style={styles.line}>
            <View style={[styles.dot, { backgroundColor: '#ffc601' }]} />
            <Text style={styles.deepText}>{this.props.bottomTitle.dkzcj}</Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
  },
  titleWrapper: {
    backgroundColor: '#fff',
    paddingLeft: 20,
  },
  header: {
    height: 55,
    borderBottomColor: '#e7e8ea',
    borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
  },
  flag: {
    width: 5,
    height: 40,
    position: 'absolute',
    top: 2,
    left: 0,
    backgroundColor: '#ffc601',
  },
  title: {
    color: '#000',
    fontSize: 18,
  },
  lineWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 20,
    left: '16%',
  },
  line: {
    flexDirection: 'row',
    height: 30,
    alignItems: 'center',
    marginRight: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  deepText: {
    color: '#3a3a3a',
    fontSize: 12,
  },
  tintText: {
    color: '#a8a8a8',
    fontSize: 12,
  },
});
