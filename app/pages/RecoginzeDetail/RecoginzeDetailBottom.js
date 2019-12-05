import React, { PureComponent } from 'react';
import { Linking, View } from 'react-native';
import PropTypes from 'prop-types';
import BottomBar from '../../components/BottomBar';

// 团购详情底部按钮页面
export default class RecoginzeDetailBottom extends PureComponent {
  static propTypes = {
    status: PropTypes.string,
    brokerPhone: PropTypes.string,
    // navigation: PropTypes.objectOf,
  };

  static defaultProps = {
    status: '',
    brokerPhone: '',
    // navigation: {},
  };

  // constructor(props) {
  //   super(props);
  // }

  callBroker(brokerPhone) {
    const url = `tel:${brokerPhone}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          // QFReactHelper.show('当前版本不支持拨打号码或发送短信', 5);
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => console.log(`未知错误${err}`));
  }

  // 根据各种状态处理底部按钮的显示
  bottomBarConfig() {
    // 已认筹 未收齐（认筹款收齐）已认筹  已收齐（转成交）已上数  已收齐 特改认筹款;
    const navigation = this.props.navigation;
    const bottomParams = this.props.bottomParams;
    const depositStatus = bottomParams.depositStatus;
    const transactionStatus = bottomParams.transactionStatus;
    const bottomBarConfig = [
      {
        text: '联系经纪人',
        iconName: 'dianhua1',
        iconSize: 18,
        iconColor: '#3a3a3a',
        onPress: () => this.callBroker(bottomParams.brokerPhone),
      },
    ];
    if (transactionStatus === '已认筹' || transactionStatus === '撤单') {
      if (depositStatus === '已收齐') {
        // 转成交
        bottomBarConfig.unshift({
          text: '转成交',
          iconName: 'zhuanchengjiao',
          iconSize: 18,
          iconColor: '#3a3a3a',
          onPress: () => {
            // 后台接口验证
            this.props.parent.validate().then((res) => {
              if (res.validateFlag) {
                this.props.parent.openTip(res.message || '服务器异常');
                return;
              }
              navigation.navigate('DealChange', { bottomParams });
            });
          },
        });
      } else if (depositStatus === '未收齐') {
        bottomBarConfig.unshift({
          text: '认筹款收齐',
          iconName: 'renchoukuanshouqi',
          iconSize: 18,
          iconColor: '#3a3a3a',
          onPress: () => this.props.parent.openModel(),
        });
      }
    }
    if (depositStatus === '已收齐' && transactionStatus === '已上数') {
      bottomBarConfig.unshift({
        text: '特改认筹款',
        iconName: 'xiugairenchoukuantegairenchoukuan',
        iconSize: 18,
        iconColor: '#3a3a3a',
        onPress: () =>
          this.props.parent.openTip('认筹款已转成交，需特改请到案场PC端'),
      });
    }
    return bottomBarConfig;
  }

  render() {
    return <BottomBar data={this.bottomBarConfig()} />;
  }
}
