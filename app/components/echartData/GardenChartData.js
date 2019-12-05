import React, { PureComponent } from 'react';
import { InteractionManager, DeviceEventEmitter, ActivityIndicator } from 'react-native';
import axios from 'axios';
import GardenChart from '../echart/GardenChart';

export default class GardenChartData extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      gardenData: {},
      loading: true,
    };
  }
  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.requestGardenData();
    });
    this.listener = DeviceEventEmitter.addListener(this.props.refresh, () => {
      this.requestGardenData();
    });
  }
  // 查询认筹楼盘统计
  requestGardenData() {
    const params = this.props.parent.filterParams;
    axios.get('companyStatistics/getSaleAndTransactionTotal', {
      params,
    })
      .then((res) => {
        if (res.data.status === 'C0000') {
          this.setState({
            gardenData: res.data.result,
            loading: false,
          });
        }
      })
      .catch(() => { });
  }

  generateGardenChart() {
    const { gardenData } = this.state;
    const totalDeal = gardenData.salesNumberTotal && gardenData.salesNumberTotal.toFixed(2) / 10000;
    const yesDeal = gardenData.transaction && gardenData.transaction.toFixed(2) / 10000;
    const noDeal = totalDeal - yesDeal > 0 ? totalDeal - yesDeal : 0;
    return {
      title: [{
        text: '在售楼盘',
        left: 'center',
        top: '38%',
        textStyle: {
          color: '#3a3a3a',
          fontWeight: 'normal',
          fontSize: 16,
          align: 'center',
        },
      }, {
        text: `${gardenData.salesNumberTotal}个`,
        left: 'center',
        top: '45%',
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
          center: ['50%', '45%'],
          hoverAnimation: false,
          color: ['#ffc601', '#e2e2e2'],
          label: {
            normal: {
              textStyle: { color: '#3a3a3a' },
            },
          },
          labelLine: { normal: { width: 1, length: 10, length2: 5 } },
          data: [
            { value: yesDeal, name: `有成交(${(yesDeal * 100 / totalDeal).toFixed(2)}%)` },
            { value: noDeal, name: `无成交(${(noDeal * 100 / totalDeal).toFixed(2)}%)` },
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
      { name: '有成交', color: '#ffc601' },
      { name: '无成交', color: '#e2e2e2' },
    ];
    // 楼盘认筹统计
    const gardenChartOption = this.generateGardenChart();
    return (
      <GardenChart
        option={gardenChartOption}
        height={275}
        style={{
          left: '35%',
        }}
        title="楼盘"
        listData={listData}
      />
    );
  }
}
