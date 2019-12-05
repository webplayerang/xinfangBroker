import React, { PureComponent } from 'react';
import {
  Linking,
} from 'react-native';
import PropTypes from 'prop-types';
// 友盟统计
import { UMNative } from '../../common/NativeHelper';
import BottomBar from '../../components/BottomBar';

// 报备详情底部按钮页面

class ReportDetailBottom extends PureComponent {
  static propTypes = {
    // parent: PropTypes.objectOf,
    status: PropTypes.string,
    brokerPhone: PropTypes.string,
    // navigation: PropTypes.objectOf,
  }

  static defaultProps = {
    // parent: {},
    status: '',
    brokerPhone: '',
    // navigation: {},
  }

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      reportDetailData: {},
    };
  }
  // componentDidMount() {
  //   InteractionManager.runAfterInteractions(this.requestData.bind(this));
  // }
  callBroker() {
    const url = `tel:${this.props.brokerPhone}`;
    Linking.canOpenURL(url).then((supported) => {
      if (!supported) {
        this.props.parent.refs.toast.show('当前版本不支持拨打号码或发送短信');
      } else {
        return Linking.openURL(url);
      }
    }).catch((err) => console.log(`未知错误${err}`));
  }
  // 根据各种状态处理底部按钮的显示
  bottomBarConfig() {
    const navigation = this.props.navigation;
    const watchComfirmStr = '确认客户已带看成功吗？';
    const reportComfirmStr = '确认客户已报备成功吗？';
    const bottomParams = this.props.bottomParams;
    const status = this.props.status;
    const bottomBarConfig = [
      {
        text: '联系经纪人',
        iconName: 'dianhua1',
        iconSize: 14,
        iconColor: '#3a3a3a',
        onPress: () => this.callBroker(),
      },
    ];
    // this.openModel(watchComfirmStr);onPress={() => navigation.navigate('EditBasicRecognize')}
    // 报备待确认BACKLOG显示操作 报备确认
    // 带看即将过期WILLOVERDUE, 未带看NO,报备成功SUCCESSFUL（显示未带看）显示操作 带看确认
    // 带看确认YES显示操作 团购认筹  上数
    if (status === 'RESERVEBACKLOG') {
      bottomBarConfig.unshift(
        {
          text: '报备确认',
          iconName: 'baobeiqueren',
          iconSize: 14,
          iconColor: '#3a3a3a',
          onPress: () => this.props.parent.openModel(reportComfirmStr, 'reservationConfirm'),
        });
    }
    if (status === 'GUIDEBACKLOG') {
      bottomBarConfig.unshift(
        {
          text: '带看确认',
          iconName: 'daikanqueren',
          iconSize: 14,
          iconColor: '#3a3a3a',
          onPress: () => this.props.parent.openModel(watchComfirmStr, 'guideConfirm'),
        });
    }
    if (status === 'YES' || status === 'WILLOVERDUE') {
      bottomBarConfig.unshift(
        {
          text: '团购认筹',
          iconName: 'tuangourenchou',
          iconSize: 14,
          iconColor: '#3a3a3a',
          onPress: () => {
            // 统计团购认筹按钮点击数
            UMNative.onEvent('RECOGNIZE_COUNT');
            // 后台接口验证
            this.props.parent.validate().then((res) => {
              if (res.validateFlag) {
                this.props.parent.openTip(res.message || '服务器异常');
                return;
              }
              navigation.navigate('EditBasicRecognize', { bottomParams });
            });
          },
        }, {
          text: '上数',
          iconName: 'shangshu',
          iconSize: 14,
          iconColor: '#3a3a3a',
          onPress: () => {
            // 统计上数按钮点击数
            UMNative.onEvent('SUBSCRIBE_COUNT');
            // 后台接口验证
            this.props.parent.validate().then((res) => {
              if (res.validateFlag) {
                this.props.parent.openTip(res.message || '服务器异常');
                return;
              }
              navigation.navigate('SubscribeDetail', { bottomParams });
            });
          },
        },
      );
    }
    if (status === 'YES' || status === 'WILLOVERDUE') {
      bottomBarConfig.push(
        {
          text: '客户意向',
          iconName: 'daikanshuom',
          iconSize: 14,
          iconColor: '#3a3a3a',
          onPress: () => this.props.parent.onExplainPopState(),
        },
      );
    }
    return bottomBarConfig;
  }

  render() {
    return (
      <BottomBar data={this.bottomBarConfig()} />
    );
  }
}

export default ReportDetailBottom;
