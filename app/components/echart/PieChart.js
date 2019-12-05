import React, { PureComponent } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Echarts from 'native-echarts';
import { screen } from '../../utils/index';

export default class PieChart extends PureComponent {
  render() {
    const { pieChartResult, option, who } = this.props;
    const height = who !== 'THIS_GARDEN' ? { height: 420 } : null;
    return (
      <View style={[styles.container, height]}>
        <View style={styles.titleWrapper}>
          <View style={styles.flag} />
          <View style={styles.header}>
            <Text style={styles.title}>分销公司</Text>
          </View>
        </View>
        <Echarts option={option} height={275} width={screen.width} />
        {who === 'THIS_GARDEN' ? (<View style={styles.gardenWrapper}>
          <View style={styles.gardenLine}>
            <View style={[styles.dot, { backgroundColor: '#73e8d5' }]} />
            <Text style={styles.deepText}>内联</Text>
          </View>
          <View style={styles.gardenLine}>
            <View style={[styles.dot, { backgroundColor: '#15a3f6' }]} />
            <Text style={styles.deepText}>外联</Text>
          </View>
          <View style={styles.gardenLine}>
            <View style={[styles.dot, { backgroundColor: '#e2e2e2' }]} />
            <Text style={styles.deepText}>其他</Text>
          </View>
          <View style={styles.gardenLine}>
            <View style={[styles.dot, { backgroundColor: '#ffc601' }]} />
            <Text style={styles.deepText}>营销</Text>
          </View>
        </View>) : (<View style={styles.lineWrapper}>
          <View style={styles.line}>
            <View style={[styles.dot, { backgroundColor: '#73e8d5' }]} />
            <Text style={styles.deepText}>内联</Text>
            <Text style={styles.tintText}>---公司：</Text>
            <Text style={styles.deepText}>{pieChartResult.inline.companySum}家，</Text>
            <Text style={styles.tintText}>经纪人：</Text>
            <Text style={styles.deepText}>{pieChartResult.inline.empCount}人</Text>
          </View>
          <View style={styles.line}>
            <View style={[styles.dot, { backgroundColor: '#15a3f6' }]} />
            <Text style={styles.deepText}>外联</Text>
            <Text style={styles.tintText}>---公司：</Text>
            <Text style={styles.deepText}>{pieChartResult.outer.companySum}家，</Text>
            <Text style={styles.tintText}>经纪人：</Text>
            <Text style={styles.deepText}>{pieChartResult.outer.empCount}人</Text>
          </View>
          <View style={styles.line}>
            <View style={[styles.dot, { backgroundColor: '#ffc601' }]} />
            <Text style={styles.deepText}>营销</Text>
            <Text style={styles.tintText}>---公司：</Text>
            <Text style={styles.deepText}>{pieChartResult.sales.companySum}家，</Text>
            <Text style={styles.tintText}>经纪人：</Text>
            <Text style={styles.deepText}>{pieChartResult.sales.empCount}人</Text>
          </View>
          <View style={styles.line}>
            <View style={[styles.dot, { backgroundColor: '#e2e2e2' }]} />
            <Text style={styles.deepText}>其他</Text>
            <Text style={styles.tintText}>---上门客、案场等</Text>
          </View>
        </View>)}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    backgroundColor: '#fff',
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
    width: screen.width,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 260,
  },
  gardenWrapper: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: '25%',
  },
  gardenLine: {
    flexDirection: 'row',
    marginRight: 10,
    marginBottom: 20,
  },
  line: {
    flexDirection: 'row',
    width: 200,
    height: 30,
    alignItems: 'center',
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
