import React, { PureComponent } from 'react';
import { DeviceEventEmitter, ActivityIndicator, InteractionManager } from 'react-native';
import axios from 'axios';
import GardenChart from '../echart/GardenChart';

export default class RecognizeChartData extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      recognizeData: {},
      loading: true,
    };
  }
  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.requestRecognizeData();
    });
    this.listener = DeviceEventEmitter.addListener(this.props.refresh, () => {
      this.requestRecognizeData();
    });
  }
  // 查询认筹楼盘统计
  requestRecognizeData() {
    const params = this.props.parent.filterParams;
    axios.get('companyStatistics/realEstateStatistics', {
      params,
    })
      .then((res) => {
        if (res.data.status === 'C0000') {
          this.setState({
            recognizeData: res.data.result,
            loading: false,
          });
        } else {
          this.setState({
            loading: false,
          });
        }
      })
      .catch(() => { });
  }

  generateRecognizeChart() {
    const { recognizeData } = this.state;
    const total = (recognizeData.turnedPrice + recognizeData.notTurnedPrice + recognizeData.refundedPrice) / 10000;
    const yzTitle = `${(recognizeData.turnedPrice / 10000).toFixed(2).replace('.00', '')}万元(${recognizeData.turnedNumber}单)`;
    const wzTitle = `${(recognizeData.notTurnedPrice / 10000).toFixed(2).replace('.00', '')}万元(${recognizeData.notTurnedNumber}单)`;
    const ytTitle = `${(recognizeData.refundedPrice / 10000).toFixed(2).replace('.00', '')}万元(${recognizeData.refundedNumber}单)`;
    return {
      color: ['#62cdff', '#ffc601', '#e2e2e2'],
      title: [{
        text: '认筹款',
        left: 'center',
        top: '28%',
        textStyle: {
          color: '#3a3a3a',
          fontWeight: 'normal',
          fontSize: 16,
          align: 'center',
        },
      }, {
        text: `${total.toFixed(2).replace('.00', '')}万元`,
        left: 'center',
        top: '35%',
        textStyle: {
          fontWeight: 'normal',
          fontSize: 14,
          align: 'center',
        },
      },
      ],
      series: [
        {
          name: '楼盘',
          type: 'pie',
          radius: ['40%', '50%'],
          center: ['50%', '35%'],
          hoverAnimation: false,
          label: {
            normal: {
              textStyle: { color: '#3a3a3a' },
            },
          },
          labelLine: { normal: { width: 1, length: 8, length2: 5 } },
          data: [
            { value: recognizeData.turnedPrice, name: yzTitle },
            { value: recognizeData.notTurnedPrice, name: wzTitle },
            { value: recognizeData.refundedPrice, name: ytTitle },
          ],
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
    const listData = [
      { name: '已转成交', color: '#62cdff' },
      { name: '未转成交', color: '#ffc601' },
      { name: '已退款', color: '#e2e2e2' },
    ];
    // 楼盘认筹统计
    const recognizeChartOption = this.generateRecognizeChart();
    return (
      <GardenChart
        option={recognizeChartOption}
        height={275}
        title="认筹统计"
        listData={listData}
      />
    );
  }
}
