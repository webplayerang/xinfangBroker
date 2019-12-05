import React, { PureComponent } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Text,
  Alert,
} from 'react-native';
import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
import Toast from 'react-native-easy-toast';

import PersonalReportSubList from './PersonalReportSubList';
import BottomBar from '../../components/BottomBar';
import Icon from '../../components/Icon/';
import GoBack from '../../components/GoBack';
import BaseStyles from '../../style/BaseStyles';
import { UMNative } from '../../common/NativeHelper';

import { screen, system } from '../../utils';

export default class PersonalReportList extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerTitle: params.gardenName,
      headerRight: (
        <TouchableOpacity
          style={{ paddingRight: 15 }}
          onPress={() => {
            params.hideButton();
            navigation.navigate('ReportListSearch', params);
          }}
        >
          <Icon name="magnifier" color="#848484" size={20} />
        </TouchableOpacity>
      ),
      headerLeft: (
        <GoBack
          navigation={navigation}
        />
      ),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      show: false,
    };
  }

  componentDidMount() {
    this.props.navigation.setParams({
      hideButton: this.hideButton.bind(this),
    });
    UMNative.onEvent('PERSONAL_REPORT_MANAGE_COUNT');
    UMNative.onPageBegin('PERSONAL_REPORT_MANAGER');
  }

  componentWillUnmount() {
    UMNative.onPageEnd('PERSONAL_REPORT_MANAGER');
  }

  hideButton() {
    this.setState({ show: false });
  }

  render() {
    const navigation = this.props.navigation;
    const bottomBarData = [
      {
        text: '新增报备',
        iconName: 'xinzengbaobei',
        iconSize: 18,
        iconColor: '#3a3a3a',
        onPress: () => {
          this.hideButton();
          UMNative.onEvent('ADD_REPORT_BUTTON_COUNT');
          const { params } = this.props.navigation.state;

          this.props.navigation.navigate('Report', params);

          // 暂时取消 已下架楼盘不能新增报备 的权限设置
          // if (params.putawayStatus === 'PUTAWAY') {
          //   this.props.navigation.navigate('Report', params);
          // } else {
          //   this.toast.show('已下架楼盘不能新增报备');
          // }
        },
        textStyle: {},
      },
      {
        text: '发布楼盘实况',
        iconName: 'fabuloupanshikuang',
        iconSize: 18,
        iconColor: '#3a3a3a',
        onPress: () => {
          const { params } = this.props.navigation.state;
          if (params.putawayStatus === 'PUTAWAY') {
            this.setState({ show: !this.state.show });
          } else {
            this.toast.show('已下架楼盘不能发布楼盘实况');
          }
        },
        textStyle: {},
      },
      {
        text: '联系开发商',
        iconName: 'dianhua1',
        iconSize: 18,
        iconColor: '#3a3a3a',
        onPress: () => {
          this.hideButton();
          const developCompanyPhone = this.ListAll.developCompanyPhone;
          if (developCompanyPhone) {
            Linking.canOpenURL(`tel:${developCompanyPhone}`)
              .then((supported) => {
                if (!supported) {
                  Alert.alert('当前版本不支持拨打号码');
                } else {
                  Linking.openURL(`tel:${developCompanyPhone}`);
                }
              })
              .catch((err) => console.log(`未知错误${err}`));
          } else {
            this.toast.show('暂无开发商电话！');
          }
        },
        textStyle: {},
      },
    ];
    return (
      <View style={BaseStyles.container}>
        <ScrollableTabView
          style={BaseStyles.main}
          tabBarTextStyle={BaseStyles.tabBarText}
          tabBarActiveTextColor="#000"
          tabBarInactiveTextColor="#3a3a3a"
          tabBarUnderlineStyle={BaseStyles.lineStyle}
          renderTabBar={() => (<ScrollableTabBar style={BaseStyles.tabBar} />)}
        >
          <PersonalReportSubList
            ref={(ListAll) => { this.ListAll = ListAll; }}
            tabLabel="全部"
            navigation={this.props.navigation}
          />
          <PersonalReportSubList tabLabel="报备待确认" status="RESERVEBACKLOG" navigation={navigation} />
          <PersonalReportSubList tabLabel="报备成功" status="GUIDEBACKLOG" navigation={navigation} />
          <PersonalReportSubList tabLabel="带看成功" status="GUIDEYES" navigation={navigation} />
        </ScrollableTabView>

        {
          this.state.show ?
            (
              <TouchableOpacity
                style={styles.parentWrapper}
                onPress={() => {
                  this.hideButton();
                }}
              >
                <View style={styles.btnWrapper}>
                  <TouchableOpacity
                    style={styles.btn}
                    onPress={() => {
                      this.props.navigation.navigate('ReleaseReport',
                        {
                          type: 'CJXX',
                          expandId: this.props.navigation.state.params.expandId,
                          gardenName: this.props.navigation.state.params.gardenName,
                        });
                      this.hideButton();
                    }}
                  >
                    <Text style={styles.text}>成交喜讯</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.line]}
                    onPress={() => {
                      this.props.navigation.navigate('ReleaseReport',
                        {
                          type: 'YHJL',
                          expandId: this.props.navigation.state.params.expandId,
                          gardenName: this.props.navigation.state.params.gardenName,
                        });
                      this.hideButton();
                    }}
                  >
                    <Text style={styles.text}>优惠奖励</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, styles.line]}
                    onPress={() => {
                      this.props.navigation.navigate('ReleaseReport',
                        {
                          type: 'SPTG',
                          expandId: this.props.navigation.state.params.expandId,
                          gardenName: this.props.navigation.state.params.gardenName,
                        });
                      this.hideButton();
                    }}
                  >
                    <Text style={styles.text}>笋盘推荐</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )
            : null
        }

        <View>
          <BottomBar data={bottomBarData} />
        </View>
        <Toast
          ref={(toast) => { this.toast = toast; }}
          positionValue={screen.height / 2}
          opacity={0.7}
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  parentWrapper: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: 'rgba(52, 52, 52, 0.5)',
  },
  btnWrapper: {
    width: screen.width / 3,
    position: 'absolute',
    left: screen.width / 3,
    bottom: system.isIphoneX ? 71 : 50,
    borderColor: '#dedfe0',
    borderWidth: StyleSheet.hairlineWidth,
  },
  btn: {
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#f6f5fa',
  },
  line: {
    borderTopColor: '#dedfe0',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  text: {
    color: '#7e7e7e',
    fontSize: 18,
  },
});
