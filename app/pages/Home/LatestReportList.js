import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  FlatList,
  DeviceEventEmitter,
  StyleSheet,
  TouchableOpacity,
  InteractionManager,
} from 'react-native';
import axios from 'axios';
import Icon from '../../components/Icon/';
import LatestReportRenderItem from './LatestReportRenderItem';
import BaseStyles from '../../style/BaseStyles';
import { screen } from '../../utils';
import { UMNative } from '../../common/NativeHelper';

export default class LatestReportList extends PureComponent {
  // static propTypes = {
  //   navigation: PropTypes.objectOf,
  // }
  // static defaultProps = {
  //   navigation: null,
  // }
  constructor(props) {
    super(props);
    this.state = {
      more: '',
      reportcontainerHeight: 50, // 每个item的高度为105，如果无数据则高度为50
      reportData: [],
      isReportData: true, // 是否显示暂无报备提示文字 flag
    };
    this.renderItem = this.renderItem.bind(this);
    this.confirmButton = this.confirmButton.bind(this);
    this.requestLatestReportData = this.requestLatestReportData.bind(this);
  }
  componentDidMount() {
    // 刷新最新报备列表
    this.listener = DeviceEventEmitter.addListener('LatestReport', this.requestLatestReportData);
    this.requestLatestReportData();
  }
  componentWillUnmount() {
    this.listener.remove();
  }
  // 获取最新报备数据
  requestLatestReportData() {
    axios.get('reservation/newReservationList')
      .then((res) => {
        this.props.home.setState({
          isRefreshing: false,
        });
        if (res.data.status !== 'C0000') {
          return;
        }
        const data = res.data.result;
        const dataLenght = data.length;
        // 数据小于3个，不显示更多按钮
        if (dataLenght === 0) {
          this.setState({
            isReportData: false,
            reportcontainerHeight: 50,
          });
          return;
        }
        if (dataLenght === 1) {
          this.setState({
            isReportData: true,
            reportcontainerHeight: 105,
            reportData: res.data.result,
          });
          return;
        }
        if (dataLenght === 2) {
          this.setState({
            isReportData: true,
            reportcontainerHeight: 210,
            reportData: res.data.result,
          });
          return;
        }
        this.setState({
          isReportData: true,
          more: '更多',
          reportcontainerHeight: 210,
          reportData: res.data.result,
        });
      })
      .catch(() => {
        this.props.home.setState({
          isRefreshing: false,
        });
      });
  }

  // 最新报备确认弹出框
  alertConfirm(item) {
    this.props.home.dialogbox.confirm({
      title: null,
      content: (
        <View style={styles.modelBox}>
          <View style={styles.modelTilteBox}>
            <Icon name="jingshi" size={20} color="#ffc601" style={{ width: 34 }} />
            <Text style={styles.modelTilte}>确认客户已报备成功吗？</Text>
          </View>
          <View style={styles.modelTextBox}>
            <Text style={styles.modelText}>客户：{item.customerName}</Text>
          </View>
          <View style={styles.modelTextBox}>
            <Text style={styles.modelText}>
              电话：{item.customerPhone}
            </Text>
          </View>
          <View style={styles.modelTextBox}>
            <Text style={styles.modelText}>
              楼盘：{item.gardenName}
            </Text>
          </View>
        </View>),
      cancel: {
        text: '报备重复',
        style: {
          color: '#3a3a3a',
          fontSize: 18,
        },
        callback: () => {
          this.props.home.dialogbox.close();
          // 请求报备重复接口/reservation/reservationRepeat
          axios.get('reservation/reservationRepeat', { params: { reservationId: item.reservationId } })
            .then((res) => {
              if (res.data.status !== 'C0000') {
                this.props.home.toast.show('报备重复 操作失败！');
                return;
              }
              this.props.home.toast.show('报备重复 操作成功！');
              // 接口成功后关闭窗口刷新报备详情页
              this.requestLatestReportData();
            });
        },
      },
      ok: {
        text: '报备成功',
        style: {
          fontSize: 18,
          color: '#ffa200',
        },
        callback: () => {
          UMNative.onEvent('HOME_REPORT_CONFIRM_COUNT');
          // 接口成功失败后关闭窗口
          this.props.home.dialogbox.close();
          axios.get('reservation/reservationConfirm', { params: { reservationId: item.reservationId } })
            .then((res) => {
              if (res.data.status !== 'C0000') {
                this.props.home.toast.show('报备确认 操作失败！');
                return;
              }
              this.props.home.toast.show('报备确认 操作成功！');
              // 接口成功后关闭窗口刷新报备详情页
              this.requestLatestReportData();
            })
            .catch(() => {
              this.props.home.toast.show('报备确认 操作失败！');
            });
        },
      },
    });
  }
  // 最新报备确认按钮
  confirmButton(item) {
    return (
      <TouchableOpacity
        onPress={() => {
          this.alertConfirm(item);
        }}
      >
        <View style={styles.confirmYellow}>
          <Text style={[BaseStyles.text16, styles.fontYellow]}>确认</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // 数据小于5个，不出现查看全部按钮
  changeMore() {
    // 点击更多展开
    if (this.state.more === '更多') {
      const len = this.state.reportData.length;
      switch (len) {
        case 1:
        case 2:
          break;
        case 3:
        case 4:
        case 5:
          this.setState({
            more: '',
            reportcontainerHeight: len * 105,
          });
          break;
        default:
          this.setState({
            more: '查看全部',
            reportcontainerHeight: 5 * 105,
          });
          break;
      }
    } else {
      // 点击查看全部跳转到报备管理
      InteractionManager.runAfterInteractions(() => {
        this.props.navigation.navigate('ReportManage');
      });
    }
  }
  // 是否有更多按钮
  haveMore() {
    if (this.state.more === '') {
      return null;
    }
    return (
      <TouchableOpacity
        style={styles.buttonMore}
        onPress={() => this.changeMore()}
        activeOpacity={1}
      >
        <View style={styles.moreContainer}>
          <Text style={[BaseStyles.black, BaseStyles.text12]}>
            {this.state.more}
          </Text>
          {this.state.more === '查看全部' ?
            <Icon name="arrow-right" size={10} color="#ffc601" style={{ marginLeft: 5 }} />
            :
            <Icon name="arrow-down" size={14} color="#ffc601" style={{ marginLeft: 5 }} />
          }
        </View>
      </TouchableOpacity >
    );
  }

  showList() {
    const data = this.state.reportData;
    return (
      <View>
        {
          data.map((val) => (
            <LatestReportRenderItem
              item={val}
              navigation={this.props.navigation}
              reportState={this.confirmButton(val)}
              key={Math.random()}
            />
          ))
        }
      </View>
    );
  }

  renderItem(data) {
    return (
      <LatestReportRenderItem
        ref={(latestReportItem) => { this.latestReportItem = latestReportItem; }}
        item={data.item}
        navigation={this.props.navigation}
        reportState={this.confirmButton(data.item)}
      />
    );
  }
  render() {
    return (
      <View style={{ overflow: 'hidden' }}>
        <View style={{ height: this.state.reportcontainerHeight }}>
          {this.state.isReportData ?
            this.showList()
            :
            <Text style={[BaseStyles.text16, BaseStyles.gray, { alignSelf: 'center' }]}>
              暂无最新报备
            </Text>
          }
        </View>
        {this.haveMore()}
      </View>

    );
  }
}
const styles = StyleSheet.create({
  buttonMore: {
    marginLeft: 15,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#e7e8ea',
    backgroundColor: '#fff',
  },
  moreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  dailyGarden: {
    marginTop: 10,
    backgroundColor: '#fff',
  },
  fontYellow: {
    color: '#ffc601',
  },
  modelBox: {
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  modelTilteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  modelTilte: {
    fontSize: 16,
    color: '#3a3a3a',
  },
  modelTextBox: {
    marginLeft: 30,
    paddingVertical: 4,
  },
  modelText: {
    fontSize: 16,
    color: '#7e7e7e',
  },
  confirmYellow: {
    borderWidth: 1,
    borderColor: '#ffc601',
    borderRadius: 3,
    width: 50,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

