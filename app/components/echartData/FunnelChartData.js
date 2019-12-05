import React, { PureComponent } from 'react';
import { DeviceEventEmitter, InteractionManager, ActivityIndicator } from 'react-native';
import axios from 'axios';
import FunnelChart from '../echart/FunnelChart';

export default class FunnelChartData extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      resultData: {},
      loading: true,
    };
    this.generateFunnelChart = this.generateFunnelChart.bind(this);
  }
  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.requestData();
    });
    this.listener = DeviceEventEmitter.addListener(this.props.refresh, () => {
      this.requestData();
    });
  }
  componentWillUnmount() {
    this.listener.remove();
  }


  getGuideCount(params) {
    return axios.get('companyStatistics/getReservationCount', { params });
  }

  getDealCount(params) {
    return axios.get('companyStatistics/getOrgunitVoInfo', { params });
  }

  // 查询全国 公司和楼盘金额相关统计
  requestData() {
    const params = this.props.parent.filterParams;
    axios.all([this.getGuideCount(params), this.getDealCount(params)])
      .then(axios.spread((guide, deal) => {
        const resultData = {};
        resultData.guideCount = guide.data.result.guideCount;
        resultData.reservationCount = guide.data.result.reservationCount;
        resultData.volume = deal.data.result.volume;
        this.setState({ resultData, loading: false });
      }));
  }
  generateFunnelChart() {
    const { resultData } = this.state;
    return {
      title: {
        text: '注：转化率以1000作为基数按比例转化',
        left: '10%',
        top: '8%',
        textStyle: {
          fontSize: 12,
          fontWeight: 'normal',
        },
      },
      color: ['#ffc601', '#4dd5a3', '#62cdff'],
      textStyle: { fontSize: 14 },
      calculable: true,
      series: [
        {
          type: 'funnel',
          left: 'center',
          width: '80%',
          // height: '60%',
          min: 40,
          max: 100,
          minSize: '30%',
          maxSize: '80%',
          sort: 'descending',
          gap: 3,
          label: { normal: { fontSize: 12, position: 'inside' } },
          data: [
            {
              value: 60,
              name: (resultData.guideCount !== 0 && `成交: ${(resultData.volume * 1000 / resultData.reservationCount).toFixed(0)}`) || '成交: 0',
            },
            {
              value: 80,
              name: (resultData.reservationCount !== 0 && `带看: ${(resultData.guideCount * 1000 / resultData.reservationCount).toFixed(0)}`) || '带看: 0',
            },
            {
              value: 100,
              name: '报备: 1000',
            },
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
    const { resultData } = this.state;
    // 转化率
    const funnelChartOption = this.generateFunnelChart();
    const bottomTitle = {
      baobei: '报备',
      bbzdk: (resultData.reservationCount !== 0 && `报备转带看(${(resultData.guideCount * 100 / resultData.reservationCount).toFixed(2).replace('.00', '')}%)`) || '报备转带看(0%)',
      dkzcj: (resultData.guideCount !== 0 && `带看转成交(${(resultData.volume * 100 / resultData.reservationCount).toFixed(2).replace('.00', '')}%)`) || '带看转成交(0%)',
    };

    return (
      <FunnelChart option={funnelChartOption} bottomTitle={bottomTitle} />
    );
  }
}
