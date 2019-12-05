import React, { PureComponent } from 'react';
import { View, InteractionManager, ActivityIndicator, DeviceEventEmitter } from 'react-native';
import axios from 'axios';
import LineChart from '../echart/LineChart';

export default class LineChartData extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      lineChartData: [],
      loading: true,
    };
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.requestLineChartData();
    });
    this.listener = DeviceEventEmitter.addListener(this.props.refresh, () => {
      this.requestLineChartData();
    });
  }

  // 查询分公司营收
  requestLineChartData() {
    const params = this.props.parent.filterParams;
    axios.get('companyStatistics/getOrgunitItems', {
      params,
    })
      .then((res) => {
        if (res.data.status === 'C0000') {
          this.setState({ lineChartData: res.data.result, loading: false });
        }
      })
      .catch(() => { });
  }

  generateLineChart() {
    const { lineChartData } = this.state;
    const cityName = { color: '#7e7e7e' };

    const data = [];
    const ysvalue = [];
    const yjvalue = [];

    lineChartData.forEach((element) => {
      if (element.orgName.length > 5) {
        element.orgName = `${element.orgName.substring(0, 5)}..`;
      }
      data.push({ value: element.orgName, textStyle: cityName });
      ysvalue.push((element.revenueAmount / 10000).toFixed(2));
      yjvalue.push((element.projectCommission / 10000).toFixed(2));
    });

    return {
      color: ['#fdc500', '#62cdff'],
      legend: {
        data: ['项目佣金(万元)', '营收(万元)'],
        textStyle: { fontSize: 10 },
        itemHeight: 10,
        top: 25,
      },
      // grid: { left: '1%' },
      dataZoom: [
        { type: 'inside', xAxisIndex: [0], start: 1, end: 35 },
      ],
      xAxis: [
        {
          type: 'category',
          boundaryGap: true,
          axisLabel: { margin: 15 },
          axisLine: { lineStyle: { color: '#e2e2e2' } },
          axisTick: { inside: true },
          data,
        },
      ],
      yAxis: [
        {
          type: 'value',
          splitLine: { show: false },
          axisLabel: { show: false },
          axisLine: { lineStyle: { color: '#e2e2e2' } },
          axisTick: { inside: true },
        },
      ],
      series: [
        {
          name: '营收(万元)',
          type: 'line',
          symbol: '',
          symbolSize: 6,
          label: {
            normal: {
              show: true,
              position: 'top',
              color: '#000',
              distance: 2,
              textStyle: { fontSize: 12 },
            },
          },
          data: ysvalue,
        },
        {
          name: '项目佣金(万元)',
          type: 'line',
          symbol: '',
          symbolSize: 6,
          label: {
            normal: {
              show: true,
              position: 'bottom',
              color: '#000',
              distance: 2,
              textStyle: { fontSize: 12 },
            },
          },
          data: yjvalue,
        },
      ],
    };
  }

  render() {
    if (this.state.loading) {
      return (<ActivityIndicator
        style={[{ height: 75, backgroundColor: 'transparent', transform: [{ scale: 1.2 }] }]}
        size="large"
        color="#ccc"
        animating
      />);
    }
    // 分公司营收
    const lineChartOption = this.generateLineChart();
    return (
      <View>
        {/* 下拉导航title 选择分公司时，不显示分公司营收折线图 */}
        {this.props.parent.props.navigation.state.params.defaultTitle ===
          '全国战况实报' ? (
            <LineChart option={lineChartOption} />
          ) : null}
      </View>
    );
  }
}
