// 改造 swiper 组件

import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, InteractionManager, ActivityIndicator, DeviceEventEmitter } from 'react-native';
import Swiper from 'react-native-swiper';
import axios from 'axios';
import CircleChart from '../../components/echartData/CicleChart';
import { screen } from '../../utils';
import { toThousands } from '../../utils/tool';
import Icon from '../../components/Icon';
import ReportCount from './ReportCount';

export default class ReformSwiper extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      resultData: {},
      loading: true,
    };
    this.leftTitle = ['', '成交金额', '营收总额'];
    this.middleTitle = ['成交金额', '营收总额', '项目佣金'];
    this.rightTitle = ['营收总额', '项目佣金', ''];
    this.textStyle = [
      { color: '#3a3a3a', fontWeight: 'normal', fontSize: 16, marginBottom: 5 },
      { color: '#3a3a3a', fontWeight: 'bold', fontSize: 18, marginBottom: 5 },
      { color: '#7e7e7e', fontWeight: 'normal', fontSize: 12, marginBottom: 5 },
    ];
    this.requestData = this.requestData.bind(this);
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.requestData();
    });
    this.listener = DeviceEventEmitter.addListener(this.props.refresh, (params) => {
      this.requestData();
    });
  }

  componentWillUnmount() {
    this.listener.remove();
  }

  // 查询全国 公司和楼盘金额相关统计
  requestData() {
    const params = this.props.parent.filterParams;
    axios.get('companyStatistics/getOrgunitVoInfo', {
      params,
    })
      .then((res) => {
        if (res.data.status === 'C0000') {
          const resultData = res.data.result;
          this.setState({
            resultData,
            loading: false,
          });
        }
      })
      .catch(() => { });
  }

  renderMap(type) {
    const { resultData } = this.state;
    const { who, parent } = this.props;
    const title = [];

    if (type === 'YSZE') {
      who === 'WHOLE_COUNTRY' && !parent.filterParams.orgunitId &&
        title.push({
          text: '全国营收',
          textStyle: this.textStyle[0],
        });
      (parent.filterParams.orgunitId || parent.filterParams.expandId) &&
        title.push({
          text: '营收总额',
          textStyle: this.textStyle[0],
        });
      title.push({
        text: `${toThousands(
          resultData.revenueAmount &&
          (resultData.revenueAmount / 10000).toFixed(2).replace('.00', ''),
        )}`,
        textStyle: this.textStyle[1],
        unit: '万元',
        unitStyle: {
          fontSize: 14,
          color: '#a8a8a8',
        },
      });
      // TODO:代码不要删除
      // title.push({
      //   text: `目标： ${toThousands(
      //     resultData.targetAmount &&
      //     resultData.targetAmount.toFixed(2).replace('.00', ''),
      //   )}万元`,
      //   textStyle: this.textStyle[2],
      // });
    } else if (type === 'CJJE') {
      title.push({
        text: '成交金额',
        textStyle: this.textStyle[0],
      });
      title.push({
        text: `${toThousands(
          resultData.volumePrice && (resultData.volumePrice / 10000).toFixed(2).replace('.00', ''),
        )}`,
        textStyle: this.textStyle[1],
        unit: '万元',
        unitStyle: {
          fontSize: 14,
          color: '#a8a8a8',
        },
      });
    } else {
      title.push({
        text: '项目佣金',
        textStyle: this.textStyle[0],
      });
      title.push({
        text: `${toThousands(
          resultData.projectCommission &&
          (resultData.projectCommission / 10000).toFixed(2).replace('.00', ''),
        )}`,
        textStyle: this.textStyle[1],
        unit: '万元',
        unitStyle: {
          fontSize: 14,
          color: '#a8a8a8',
        },
      });
    }

    const value = 100;
    // TODO:代码不要删除
    // if (type === 'YSZE') {
    //   if (resultData.targetAmount === 0) {
    //     value = 100;
    //   } else {
    //     value = ((resultData.revenueAmount / 10000) / resultData.targetAmount).toFixed(2) * 100;
    //     if (value > 100) {
    //       value = 100;
    //     }
    //   }
    // }

    const option = {
      title,
      value,
    };

    return option;
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
    // 成交金额
    const CJJEOPTION = this.renderMap('CJJE');
    // 营收总额
    const YSZEOPTION = this.renderMap('YSZE');
    // 项目佣金
    const XMYJOPTION = this.renderMap('XMYJ');

    const { resultData } = this.state;

    return (
      <View style={{ backgroundColor: '#fff', flex: 1, marginTop: 10 }}>
        <Swiper
          height={275}
          showsButtons
          index={1}
          loop={false}
          buttonWrapperStyle={{ zIndex: 999 }}
          prevButton={
            <Icon
              name="arrow-left"
              size={20}
              color="#000"
              style={{
                paddingRight: 30,
                marginLeft: 8,
                height: 40,
                paddingVertical: 10,
              }}
            />
          }
          nextButton={
            <Icon
              name="arrow-right"
              size={20}
              color="#000"
              style={{
                paddingLeft: 30,
                marginRight: 8,
                height: 40,
                paddingVertical: 10,
              }}
            />
          }
          showsPagination={false}
        >
          <View style={styles.slide}>
            <CircleChart title={this.leftTitle} option={CJJEOPTION} />
          </View>
          <View style={styles.slide} >
            <CircleChart title={this.middleTitle} option={YSZEOPTION} />
          </View>
          <View style={styles.slide}>
            <CircleChart title={this.rightTitle} option={XMYJOPTION} />
          </View>
        </Swiper>
        <View style={styles.box}>
          <ReportCount refresh={this.props.refresh} params={this.props.parent.filterParams} />
          <View style={styles.boxItem}>
            <Text style={styles.itemTitle}>成交量</Text>
            <Text style={styles.itemValue}>{resultData.volume}</Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  buttonText: {
    color: '#3a3a3a',
    fontSize: 30,
  },
  slide: {
    height: 75,
  },
  box: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopColor: '#e7e8ea',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e7e8ea',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  boxItem: {
    paddingVertical: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    width: screen.width / 3,
    height: 80,
    borderRightColor: '#e7e8ea',
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  itemTitle: {
    color: '#a8a8a8',
    fontSize: 14,
  },
  itemValue: {
    color: '#3a3a3a',
    fontSize: 18,
  },
});
