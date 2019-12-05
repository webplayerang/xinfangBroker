import React, { PureComponent } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Echarts from 'native-echarts';
import { screen } from '../../utils/index';

export default class GardenChart extends PureComponent {
  renderList() {
    return this.props.listData.map((val) => (
      <View style={styles.line} key={Math.random()}>
        <View style={[styles.dot, { backgroundColor: val.color }]} />
        <Text style={styles.deepText}>{val.name}</Text>
      </View>
    ));
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.titleWrapper}>
          <View style={styles.flag} />
          <View style={styles.header}>
            <Text style={styles.title}>{this.props.title}</Text>
          </View>
        </View>
        <Echarts
          option={this.props.option}
          height={this.props.height}
          width={screen.width}
        />
        <View style={[styles.lineWrapper, this.props.style]}>
          {this.renderList()}
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
  lineWrapper: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 30,
    left: '20%',
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: '#fff',
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
