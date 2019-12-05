import React, { PureComponent } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Echarts from 'native-echarts';
import { screen } from '../../utils/index';

export default class LineChart extends PureComponent {
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.titleWrapper}>
          <View style={styles.flag} />
          <View style={styles.header}>
            <Text style={styles.title}>分公司营收</Text>
          </View>
        </View>
        <Echarts
          option={this.props.option}
          height={300}
          width={screen.width}
        />
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
  flag: {
    width: 5,
    height: 40,
    position: 'absolute',
    top: 8,
    left: 0,
    backgroundColor: '#ffc601',
  },
  header: {
    height: 55,
    borderBottomColor: '#e7e8ea',
    borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
  },
  title: {
    color: '#000',
    fontSize: 18,
  },
  cityName: {
    fontSize: 12,
    color: '#3a3a3a',
  },
});
