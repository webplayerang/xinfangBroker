import React, { PureComponent } from 'react';
import {
  Alert,
  Platform,
  StatusBar,
  BackHandler,
  ToastAndroid, // 只有安卓提示退出，所以不用考虑ios
  DeviceEventEmitter,
  StyleSheet,
} from 'react-native';
import { createStackNavigator } from 'react-navigation';
import JPushModule from 'jpush-react-native';
import codePush from 'react-native-code-push';

import { UMNative } from './common/NativeHelper';
import HTTPAdapter from './common/HTTPAdapter';
import Routers from './common/Routers';
// 需引入，并将 storage 引用于 global 下
import './common/Storage';
import { system } from './utils/';

import ProgressBarDialog from './components/ProgressBarDialog/ProgressBarDialog';

// test umeng
// api doc: http://dev.umeng.com/analytics/h5/react-native%E9%9B%86%E6%88%90%E6%96%87%E6%A1%A3#2_4_2
UMNative.onPageBegin('index');
UMNative.onEvent('aaaaaaaa');
// UMNative.onEvent('bbbbbbbb');
// UMNative.onEventWithLabel('aaaaaaaa', 'testLabel');
console.log('umeng object:', UMNative);
// end test umeng,
let marginTop = 0;
if (system.isIphoneXs) {
  marginTop = 20;
}
// useStrict(true);
const navigatorConfig = {
  navigationOptions: {
    headerBackTitle: null,
    headerTintColor: '#333',
    showIcon: true,
    headerStyle: {
      backgroundColor: '#fff',
      borderBottomWidth: StyleSheet.hairlineWidth, // 和iPhone的默认底部边框线保持一致
      borderBottomColor: '#d9d8d9',
      elevation: 999,
      zIndex: 999,
      marginTop,
      ...Platform.select({
        android: {
          paddingTop: 20,
          height: 70,
        },
      }),
    },
    headerTitleStyle: {
      width: system.isIOS ? '100%' : '89%',
      textAlign: 'center',
      fontWeight: 'normal',
      color: '#3a3a3a',
      fontSize: 18,
    },
  },
};

async function initRouer() {
  return global.storage.load({
    key: 'adv',
  }).then((res) => res).catch(() => false);
}

async function setRouter() {
  const flag = await initRouer();
  navigatorConfig.initialRouteName = flag ? 'Login' : 'AdvSwiper';
}

setRouter();

// 通过 navigationState 获取当前路由名称
function getRouteName(navigationState) {
  if (!navigationState) {
    return null;
  }
  const route = navigationState.routes[navigationState.index];

  if (route.routes) {
    // console.log('route.routes', route.routes);
    return getRouteName(route);
  }
  // console.log('route.routeName = ' + route.routeName);
  return route.routeName;
}

// 对于不同平台和页面设置不同的状态栏颜色和底部TAB
// function renderStatusBar(page) {
//   StatusBar.setBarStyle('dark-content');
//   if (page === 'Home') {
//     // StatusBar.setBarStyle('dark-content');
//     // DeviceEventEmitter.emit('ChangeSetBarStyle');
//     // QFReactHelper.showMainTabbar(true);
//   } else {
//     // StatusBar.setBarStyle('dark-content');
//     // QFReactHelper.showMainTabbar(false);
//   }
// }

// 外联用户首页隐藏原生 APP 底部 TAB，并设置状态栏文字颜色
function navigationChange(prevState, currentState) {
  const prevPage = getRouteName(prevState);
  const currentPage = getRouteName(currentState);

  if (prevPage !== currentPage) {
    // UMNative.onPageEnd(`HC-${prevPage}`);
    // UMNative.onPageBegin(`HC-${currentPage}`);

    console.log(`prevPage=${prevPage}, currentPage=${currentPage}`);
    // renderStatusBar(currentPage);
  }
}

class Root extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      MyNavigator: null,
      progressModalVisible: false,
      progress: 0,
    };
    this.saveMessage = this.saveMessage.bind(this);
    this.getMessage = this.getMessage.bind(this);

    this.initNavigator();
  }

  componentWillMount() {
    // 监听安卓后退按钮
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
    }
    // UMNative.onPageBegin(navigatorConfig.initialRouteName);
  }

  componentDidMount() {
    if (!system.isIOS) {
      JPushModule.notifyJSDidLoad((resultCode) => {
        if (resultCode === 0) {
          console.log(resultCode);
        }
      });
    }

    JPushModule.addReceiveNotificationListener((map) => {
      // 推送ios和安卓对象有区别
      let content = '';
      let reservationId = '';
      if (system.isIOS) {
        content = map.aps.alert;
        reservationId = map.reservationId;
      } else {
        const extras = JSON.parse(map.extras);
        content = map.alertContent;
        reservationId = extras.reservationId;
      }
      // 刷新最新报备列表
      DeviceEventEmitter.emit('LatestReport');
      this.saveMessage({ content, reservationId });
    });

    JPushModule.addReceiveOpenNotificationListener((map) => {
      let extras;
      if (system.isIOS) {
        extras = { reservationId: map.reservationId };
      } else {
        extras = JSON.parse(map.extras);
      }

      // Alert.alert(
      //   '测试提示', JSON.stringify(map.extras), [
      //     { text: '确定' },
      //   ]);
      DeviceEventEmitter.emit('OpenNotification', extras);
    });
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
    }
    // UMNative.onPageEnd(navigatorConfig.initialRouteName);
    JPushModule.removeReceiveCustomMsgListener();
    JPushModule.removeReceiveNotificationListener();
    JPushModule.clearAllNotifications();
    // android退出软件时提示removeOpenNotificationListener不是一个function
    // JPushModule.removeOpenNotificationListener();
  }

  // 安卓后退按钮无后退页面时，提示退出
  onBackAndroid = () => {
    console.log('last Back Pressed time', this.lastBackPressed);
    if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
      // 最近2秒内按过back键，可以退出应用。
      return false;
    }

    this.lastBackPressed = Date.now();

    ToastAndroid.show('再按一次退出应用!', ToastAndroid.SHORT);

    return true;
  };

  async getMessage() {
    return global.storage
      .load({
        key: 'MessageData',
      })
      .then((ret) => {
        if (ret.items && ret.items.length > 0) {
          return ret.items;
        }
        return [];
      })
      .catch(() => []);
  }

  async saveMessage(opts) {
    const data = await this.getMessage();
    const params = {
      content: opts.content,
      reservationId: opts.reservationId,
    };
    data.unshift(params);
    global.storage.save({
      key: 'MessageData',
      data: {
        items: data,
      },
      expires: 1000 * 3600 * 3, // 失效期3天
    });

    // 触发消息页面自动刷新
    DeviceEventEmitter.emit('MessageRefresh');
  }

  // 根据用户类型定义路由入口,监听后退到主页
  async initNavigator() {
    // 设置状态栏文字颜色
    StatusBar.setBarStyle('dark-content');

    const managerSid = await global.storage
      .load({
        key: 'managerSid',
      })
      .then((res) => {
        console.log('managerSid:', res);
        return res;
      })
      .catch((err) => {
        console.log('could not get managerSid.', err);
        return '';
      });

    if (managerSid) {
      navigatorConfig.initialRouteName = 'TabHome';

      HTTPAdapter.initInterceptors();
      HTTPAdapter.setup({
        managerSid,
      });
    }

    const MyNavigator = createStackNavigator(Routers, navigatorConfig);
    // const MyNavigator = createStackNavigator({
    //   Test: Routers.Test,
    //   // TabHome: Routers.TabHome,
    // });
    const defaultGetStateForAction = MyNavigator.router.getStateForAction;
    //
    MyNavigator.router.getStateForAction = (action, state) => {
      if (
        state &&
        action.type === 'Navigation/BACK' &&
        (state.routes[state.index].routeName === 'TabHome' ||
          state.routes[state.index].routeName === 'Login')
      ) {
        return null;
      }

      return defaultGetStateForAction(action, state);
    };

    this.setState({
      MyNavigator,
    });
  }

  // 热更新过程中状态发生变化
  codePushStatusDidChange(status) {
    switch (status) {
      case codePush.SyncStatus.DOWNLOADING_PACKAGE:
        this.setState({
          progressModalVisible: true,
        });
        console.log('Downloading package.');
        break;
      case codePush.SyncStatus.INSTALLING_UPDATE:
        this.setState({
          progressModalVisible: false,
        });
        console.log('Installing update.');
        break;
      case codePush.SyncStatus.UP_TO_DATE:
        console.log('Up-to-date.');
        break;
      case codePush.SyncStatus.UPDATE_INSTALLED:
        console.log('Update installed.');
        Alert.alert('更新提示', '更新安装成功。', [{ text: '确定' }]);
        break;
      case codePush.SyncStatus.CHECKING_FOR_UPDATE:
      default:
        console.log('Checking for updates.');
        break;
    }
  }

  // 热更新下载包时实时更新已下载的字节数
  codePushDownloadDidProgress(progress) {
    this.setState({
      progress: Math.round(progress.receivedBytes / progress.totalBytes * 100),
    });
    console.log(
      `progress: ${progress.receivedBytes} of ${progress.totalBytes} received.`,
    );
  }

  render() {
    const { MyNavigator } = this.state;
    if (MyNavigator) {
      if (Platform.OS !== 'ios') {
        StatusBar.setTranslucent(true);
        StatusBar.setBackgroundColor('transparent');
      }

      // renderStatusBar(navigatorConfig.initialRouteName);

      return this.state.progressModalVisible ? (
        <ProgressBarDialog
          transparent={false}
          progress={this.state.progress}
          progressModalVisible={this.state.progressModalVisible}
          needCancle={false}
        />
      ) : (
        <MyNavigator onNavigationStateChange={navigationChange} />
      );
    }
    return null;
  }
}

// 定义热更新相关选项
export default codePush({
  updateDialog: {
    appendReleaseDescription: true,
    descriptionPrefix: '更新内容：\n',
    mandatoryContinueButtonLabel: '继续',
    mandatoryUpdateMessage: '有新版本更新了，请安装。\n\n',
    optionalIgnoreButtonLabel: '稍后',
    optionalInstallButtonLabel: '安装',
    optionalUpdateMessage: '有新版本更新了，是否要安装？',
    title: '更新提示',
  },
  installMode: codePush.InstallMode.IMMEDIATE,
})(Root);

// export default Root;
