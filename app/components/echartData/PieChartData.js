import React, { PureComponent } from 'react';
import { View, DeviceEventEmitter, ActivityIndicator, InteractionManager } from 'react-native';
import axios from 'axios';
import PieChart from '../echart/PieChart';

export default class PieChartData extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      pieChartData: [],
      loading: true,
    };
    this.pieChartResult = {};
    this.serverDate = '';
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.requestPieChartData();
    });
    this.listener = DeviceEventEmitter.addListener(this.props.refresh, () => {
      this.requestPieChartData();
    });
  }

  // 查询分销公司数据
  requestPieChartData() {
    const params = this.props.parent.filterParams;
    axios.get('companyStatistics/staticsOrgunitAndCompany', {
      params,
    })
      .then((res) => {
        if (res.data.status === 'C0000') {
          this.setState({ pieChartData: res.data.result, loading: false });
        }
      })
      .catch(() => { });
  }

  generatePieChart() {
    const { pieChartData } = this.state;
    const data = [];
    let total = 0;
    pieChartData.forEach((ele) => {
      total += ele.revenue;
    });
    if (total === 0) {
      total = 1;
    }
    pieChartData.forEach((ele) => {
      if (ele.type === 'INLINE') {
        this.pieChartResult.inline = {
          companySum: ele.companySum,
          empCount: ele.empCount,
        };
        data.push({ itemStyle: { normal: { color: '#73e8d5' } }, value: ele.revenue, name: `内联 (${(ele.revenue * 100 / total).toFixed(2).replace('.00', '')}%)` });
      } else if (ele.type === 'OUTREACH') {
        this.pieChartResult.outer = {
          companySum: ele.companySum,
          empCount: ele.empCount,
        };
        data.push({ itemStyle: { normal: { color: '#15a3f6' } }, value: ele.revenue, name: `外联 (${(ele.revenue * 100 / total).toFixed(2).replace('.00', '')}%)` });
      } else if (ele.type === 'SALES') {
        this.pieChartResult.sales = {
          companySum: ele.companySum,
          empCount: ele.empCount,
        };
        data.push({ itemStyle: { normal: { color: '#ffc601' } }, value: ele.revenue, name: `营销 (${(ele.revenue * 100 / total).toFixed(2).replace('.00', '')}%)` });
      } else {
        data.push({ itemStyle: { normal: { color: '#e2e2e2' } }, value: ele.revenue, name: `其他 (${(ele.revenue * 100 / total).toFixed(2).replace('.00', '')}%)` });
      }
    });
    return {
      title: {
        text: '营收占比',
        left: 'center',
        top: '33%',
        textStyle: {
          color: '#031f2d',
          fontWeight: 'normal',
          fontSize: 16,
          align: 'center',
        },
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '50%'],
          center: ['50%', '35%'],
          data: data.reverse(),
          label: {
            normal: {
              fontSize: 12,
              textStyle: { color: '#3a3a3a' },
            },
          },
          labelLine: {
            normal: { length: 10, length2: 5, lineStyle: { width: 1 } },
          },
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
    // 分销公司统计数据
    const pieChartOption = this.generatePieChart();
    return (
      <View>
        {pieChartOption.series[0].data.length > 0 ? (<PieChart option={pieChartOption} who={this.props.who} pieChartResult={this.pieChartResult} />) : null}
      </View>
    );
  }
}
