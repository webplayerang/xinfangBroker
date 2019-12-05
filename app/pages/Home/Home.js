import React, { PureComponent } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  InteractionManager,
  Modal,
  DeviceEventEmitter,
  RefreshControl,
} from 'react-native';
import { StackActions, NavigationActions } from 'react-navigation';

import axios from 'axios';
import Toast from 'react-native-easy-toast';
import DialogBox from '../../components/react-native-dialogbox';
import Icon from '../../components/Icon/';
import { UMNative } from '../../common/NativeHelper';
import QuickEntry from './QuickEntry';
// import DailyGardenList from './DailyGardenList';
import MyReleaseList from './MyReleaseList';
import LatestReportList from './LatestReportList';
import BaseStyles from '../../style/BaseStyles';
import { screen, system } from '../../utils';

import HTTPAdapter from '../../common/HTTPAdapter';

// const resetAction = NavigationActions.reset({
//   index: 0,
//   actions: [NavigationActions.navigate({ routeName: 'Login' })],
// });
let iosTop = 20;
if (system.isIphoneX) {
  iosTop = 50;
} else if (system.isIphoneXs) {
  iosTop = 60;
}
export default class Home extends PureComponent {
  static navigationOptions = {
    header: null,
  };
  // static propTypes = {
  //   navigation: PropTypes.objectOf(PropTypes.object),
  //   navigate: PropTypes.func,
  // }
  // static defaultProps = {
  //   navigation: null,
  //   navigate: null,
  // }
  constructor(props) {
    super(props);
    this.state = {
      isRefreshing: false,
      modalVisible: false,
      alertAdv: '',
      headerAdv: '',
      url: '',
    };
    this.changeSearchBarStyle = this.changeSearchBarStyle.bind(this);
    this.navigateTo = this.navigateTo.bind(this);
    this.onClose = this.onClose.bind(this);
    this.getAlertAdv = this.getAlertAdv.bind(this);
    this.getHeaderAdv = this.getHeaderAdv.bind(this);
  }

  componentDidMount () {
    // 用于当点击推送通知后，打开报备详情
    this.openNotificationListener = DeviceEventEmitter.addListener(
      'OpenNotification',
      (data) => {
        this.navigateTo('ReportDetail', data);
      },
    );

    // 监听退出
    this.LogoutListener = DeviceEventEmitter.addListener('Logout', () => {
      // 移除 本地的managerSid，app重启时 页面进入 login
      global.storage.remove({
        key: 'managerSid',
      });

      // 移除全局请求 默认参数 managerSid
      HTTPAdapter.setup({ managerSid: '' });

      axios.get('user/logout');

      // this.props.navigation.popToTop();
      // this.props.navigation.popToTop('Login');

      const resetAction = StackActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: 'Login' })],
      });
      this.props.navigation.dispatch(resetAction);
    });

    // 切换到用户上次登录岗位，如果岗位不存在，则为默认主岗位,
    //  后台已经保存了选择后的岗位 30分钟，
    // this.changePosition(); 暂时不用该功能

    this.getAlertAdv();
    this.getHeaderAdv();
  }

  componentWillUnmount () {
    this.LogoutListener.remove();
    this.openNotificationListener.remove();
  }


  onClose () {
    this.setState({
      modalVisible: false,
    });
  }

  onRefresh = () => {
    this.setState({ isRefreshing: true });
    DeviceEventEmitter.emit('LatestReport');
  };

  getHeaderAdv () {
    axios.get('/ad/getAdByPostion', {
      params: {
        brokerAppPosition: 'TopHomePage',
      },
    }).then((res) => {
      if (res.data.status === 'C0000' && res.data.result.picFdfsUrls.length > 0) {
        this.setState({
          headerAdv: res.data.result.picFdfsUrls[0].replace('{size}', '750x430'),
        });
      }
    });
  }

  getAlertAdv () {
    axios.get('/ad/getAdByPostion', {
      params: {
        brokerAppPosition: 'HomeWindow',
      },
    }).then((res) => {
      if (res.data.status === 'C0000' && res.data.result.picFdfsUrls.length > 0) {
        this.setState({
          modalVisible: true,
          alertAdv: res.data.result.picFdfsUrls[0].replace('{size}', '750x480'),
          url: res.data.result.webUrl,
        });
      }
    });
  }

  getServerDate () {
    // 获取服务器日期失败时，给本地日期作为默认值
    return axios.get('companyStatistics/getCurrentDate')
      .then((res) => res.data.result.substring(0, 7).replace('/', '-'))
      .catch(() => new Date().toLocaleDateString().substring(0, 7).replace('/', '-'));
  }

  // 获取导航下拉title
  getFilterData () {
    return axios.get('companyStatistics/getOrgunits')
      .then((res) => {
        if (res.data.status === 'C0000') {
          return res.data.result;
        }
        return [];
      })
      .catch(() => []);
  }

  // 切换到用户上次登录岗位，如果岗位不存在，则为默认主岗位
  async changePosition () {
    const positionId = await global.storage
      .load({ key: 'positionId' })
      .then((res) => res)
      .catch(() => (''));

    axios.get('/user/changPosition', {
      params: { positionId },
    })
      .then((res) => {
        if (res.data.status === 'C0000') {
          console.log(res, '重启后岗位切换成功！');
        } else {
          console.log(res, '重启后岗位切换失败！');
        }
      })
      .catch((err) => {
        console.log(err, '重启后岗位切换失败！');
      });
  }

  // 滚动时搜索框透明度
  changeSearchBarStyle (event) {
    const top = event.nativeEvent.contentOffset.y;
    this.top = top;
    global.requestAnimationFrame(() => {
      let opacity = 0;
      let rgb = 0;
      let backgroundColor = 'transparent';
      let borderBottomColor = 'transparent';
      let inputBackgroundColor = 'rgba(255, 255, 255)';
      if (top > 10) {
        // StatusBar.setBarStyle('dark-content', true);
        opacity = (top - 10) / 100;
        rgb = 230 - opacity;
        backgroundColor = `rgba(246, 245, 250, ${opacity})`;
        borderBottomColor = `rgba(200, 200, 200, ${opacity})`;
        inputBackgroundColor = `rgba(${rgb}, ${rgb}, ${rgb},1)`;
      } else {
        // StatusBar.setBarStyle('light-content', true);
        inputBackgroundColor = 'rgba(255, 255,255,1)';
      }
      this.searchBar.setNativeProps({
        style: {
          backgroundColor,
          borderBottomColor,
        },
      });
      this.searchView.setNativeProps({
        style: { backgroundColor: inputBackgroundColor },
      });
    });
  }


  // 跳转路由 公共方法
  navigateTo (route, params = {}) {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  // 获取服务器日期后 再跳转 业绩报告
  toPerformanceReport () {
    axios.all([this.getServerDate(), this.getFilterData()])
      .then(axios.spread((serverDate, filterData) => {
        axios.get('companyStatistics/getRegionalAuthorityEnum')
          .then((res) => {
            const who = res.data.result;
            if (who === 'WHOLE_COUNTRY') {
              filterData.unshift({ name: '全国战况实报' });
              UMNative.onEvent('COUNTRY_PERFORMANCE_COUNT');
              this.navigateTo('CountryPerformance',
                { who, serverDate, filterData, defaultTitle: '全国战况实报' });
            } else if (who === 'WHOLE_CITY') {
              UMNative.onEvent('CITY_PERFORMANCE_COUNT');
              this.navigateTo('CountryPerformance',
                {
                  who,
                  serverDate,
                  filterData,
                  defaultTitle: filterData[0].name,
                  orgunitId: filterData[0].id,
                });
            } else {
              UMNative.onEvent('GARDEN_PERFORMANCE_COUNT');
              this.navigateTo('PerforGardenAll', {
                who, serverDate, defaultTitle: '全部楼盘', flag: true,
              });
            }
          })
          .catch(() => {
            this.toast.show('业绩报告接口异常');
          });
      }));
  }

  render () {
    return (
      <View style={BaseStyles.container}>
        <Modal
          visible={this.state.modalVisible}
          animationType={'none'}
          transparent
          onRequestClose={() => { }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => {
              if (this.state.url) {
                this.navigateTo('ViewPage', { url: this.state.url });
              }
              this.onClose();
            }}
          >
            <View style={styles.modalBackground}>
              <View style={[styles.modalBox, {
                alignItems: 'center',
                left: '50%',
                marginLeft: -150,
                position: 'absolute',
                top: 40,
              }]}
              >
                <Image
                  style={[styles.bannerImg, { height: 480 }]}
                  source={{ uri: this.state.alertAdv }}
                />
              </View>
              <View style={{
                left: '50%',
                marginLeft: -1,
                top: 520,
                position: 'absolute',
                width: 1,
                height: 40,
                backgroundColor: '#fff',
              }}
              />
              <TouchableOpacity
                style={{
                  left: '50%',
                  marginLeft: -15,
                  position: 'absolute',
                  top: 550,
                  width: 30,
                  height: 30,
                }}
                onPress={() => {
                  this.onClose();
                }}
              >
                <Icon name="baocuo2" size={30} color="#fff" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* 搜索框start */}
        <View
          ref={(searchBar) => { this.searchBar = searchBar; }}
          style={styles.searchBar}
        >
          <View
            ref={(searchView) => {
              this.searchView = searchView;
            }}
            style={styles.searchBox}
          >
            <TouchableOpacity
              onPress={() => {
                this.navigateTo('ReportListSearch');
              }}
            >
              <View
                style={styles.searchView}
              >
                <Icon
                  name="magnifier"
                  size={18}
                  color="#7e7e7e"
                  style={{ marginLeft: 10 }}
                />
                <Text style={styles.searchText}>经纪人/客户/客户手机</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                this.navigateTo('ScanQRcode');
              }}
              style={styles.qrCodeView}
            >
              <View style={styles.qrCode}>
                <Icon
                  name="saoyisao"
                  size={18}
                  color="#7e7e7e"
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        {/* 搜索框end */}

        <ScrollView
          style={styles.main}
          onScroll={this.changeSearchBarStyle}
          scrollEventThrottle={16} // ios 控制滚动时每秒调用onScroll事件数
          ref={(scrollView) => {
            this.scrollView = scrollView;
          }}
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={this.onRefresh}
              tintColor="#999"
              colors={['#999']}
              progressBackgroundColor="#fff"
            />
          }
        >
          {/* 头部banner start */}
          <View style={styles.header}>
            <Image
              style={styles.bannerImg}
              source={this.state.headerAdv ? { uri: this.state.headerAdv } : require('../../assets/img/banner.png')}
            />
          </View>
          {/* 头部banner end */}

          {/* 快速入口start */}

          <QuickEntry parent={this} navigation={this.props.navigation} />
          {/* 快速入口end */}

          {/* 最新报备start */}
          <View style={styles.latestReport}>
            <View style={styles.commonHeader}>
              <View style={styles.leftYellow}>
                <Text style={styles.commonTitle}>最新报备</Text>
              </View>
            </View>
            <View>
              <LatestReportList
                ref={(latestReportList) => {
                  this.latestReportList = latestReportList;
                }}
                navigation={this.props.navigation}
                home={this}
              />
            </View>
          </View>
          {/* 最新报备end */}

          {/* 常看楼盘start */}
          {/* <View style={BaseStyles.container}>
            <View style={styles.dailyGarden}>
              <View style={styles.commonHeader}>
                <View style={styles.leftYellow}>
                  <Text style={styles.commonTitle}>常看楼盘</Text>
                </View>
              </View>
              <View>
                <DailyGardenList navigation={this.props.navigation} />
              </View>
            </View>
          </View> */}
          {/* 常看楼盘end */}

          {/* 我的历史发布start */}
          <View style={{ paddingBottom: 10 }}>
            <MyReleaseList navigation={this.props.navigation} />
          </View>
          {/* 我的历史发布end */}
        </ScrollView>
        {/* 弹出框 */}
        <Toast
          ref={(toast) => {
            this.toast = toast;
          }}
          positionValue={screen.height / 2}
          opacity={0.7}
        />
        <DialogBox
          ref={(dialogbox) => {
            this.dialogbox = dialogbox;
          }}
        />
      </View >
    );
  }
}
const styles = StyleSheet.create({
  main: {
    flexDirection: 'column',
    backgroundColor: '#f5f5f9',
  },
  header: {
    height: screen.height * 0.3,
  },
  bannerImg: {
    alignItems: 'center',
    resizeMode: 'cover',
    width: '100%',
    height: screen.height * 0.3,
  },
  searchBar: {
    width: '100%',
    zIndex: 3,
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingTop: system.isIOS ? iosTop : 30,
    paddingBottom: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(200, 200, 200, 0)',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,1)',
  },
  searchView: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  searchText: {
    color: '#7e7e7e',
    marginLeft: 8,
    fontSize: 14,
  },
  qrCodeView: {
    height: 40,
    paddingTop: 5,
    paddingBottom: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCode: {
    width: 60,
    borderLeftWidth: 1,
    borderLeftColor: '#7e7e7e',
    alignItems: 'center',
  },
  quickEntry: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: '#fff',
    height: 120,
  },
  entryItem: {
    flex: 1,
    alignItems: 'center',
  },
  entryItemIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryItemText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 10,
    color: '#3a3a3a',
  },
  commonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 66,
  },
  leftYellow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderLeftWidth: 3,
    borderLeftColor: '#ffc601',
  },
  commonTitle: {
    paddingLeft: 12,
    fontSize: 18,
    color: '#3a3a3a',
  },
  myRelease: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  myReleaseMore: {
    height: '100%',
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  latestReport: {
    marginTop: 10,
    backgroundColor: '#fff',
  },
  buttonMore: {
    marginLeft: 15,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#e7e8ea',
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
  tipIcon: {
    width: 34,
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
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBox: {
    width: 300,
    // height: 450,
    backgroundColor: '#ededed',
  },
});
