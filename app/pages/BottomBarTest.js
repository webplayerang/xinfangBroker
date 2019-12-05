import React from 'react';
import { View } from 'react-native';
import BottomBar from '../components/BottomBar';
import { screen } from '../utils';

export default class BottomBarTest extends React.Component {
  static navigationOptions = () => ({
    title: '置底工具栏',
  });

  render() {
    // 定义底部按钮数据源
    const data1 = [
      {
        text: '团购',
        iconName: 'navigate-go-back',
        iconSize: 18,
        top: true, // or bottom: true 默认底
        iconColor: '#f91',
        onPress() { },
        textStyle: { color: '#f91' },
      },
      {
        text: '认筹',
        iconName: 'dianhua',
        iconSize: 18,
        iconColor: '#3a3a3a',
        onPress() { },
        textStyle: { fontWeight: 'bold' },
      },
      {
        text: '上数',
        iconName: 'no-data-found',
        iconSize: 18,
        iconColor: '#3a3a3a',
        onPress() { },
        textStyle: {},
      },
    ];
    const data2 = [
      {
        text: '团购',
        iconName: 'navigate-go-back',
        iconSize: 18,
        iconColor: '#f91',
        onPress() { },
        textStyle: { color: '#f91' },
      },
      {
        text: '认筹',
        iconName: 'dianhua',
        iconSize: 18,
        iconColor: '#3a3a3a',
        onPress() { },
        textStyle: { fontWeight: 'bold' },
      },
    ];
    const data3 = [
      {
        text: '团购',
        iconName: 'navigate-go-back',
        iconSize: 18,
        iconColor: '#f91',
        onPress() { },
        textStyle: { color: '#f91' },
      },
    ];
    return (
      <View style={{ height: screen.height }}>
        <BottomBar data={data1} top />
        {/* <BottomBar data={data2} bottom />
        <BottomBar data={data3} /> */}
      </View>
    );
  }
}

