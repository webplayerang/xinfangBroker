import React, { PureComponent } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  DeviceEventEmitter,
  NetInfo,
  Platform,
  ScrollView,
} from 'react-native';
import { withNavigation } from 'react-navigation';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import Icon from '../../components/Icon';
import { screen, system } from '../../utils';
import DynamicItem from './components/DynamicItem';
import FlatListPackage from '../../components/FlatListPackage';
import baseStyles from '../../style/BaseStyles';

let height = 50;
let paddingTop = 25;
if (system.isIphoneX) {
  height = 70;
  paddingTop = 35;
} else if (system.isIphoneXs) {
  height = 80;
  paddingTop = 40;
}
class HomeDynamicList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      houseId: null,
      houseName: '楼盘动态', // title
      tabIndex: 0, //
      dynamicTypeArr: ['全部动态', '我发布的'],
      isfirstArr: ['AllDynamicList'], // 防止首次加载两次
      isDynamicTypeArr: ['AllDynamicList'], // 初始数组防止刷新
      dynamicTypeEventArr: ['AllDynamicList', 'MyDynamicList'], // 此处的数组要与下边tab 字符串对应
      showScrollableAll: true,
      showScrollableMine: false,
    };
    this.scrollViewStartOffsetX = 0;
    this.scrollViewStartOffsetY = 0;
    this.scrollViewEndOffsetX = 0;
    this.scrollViewEndOffsetY = 0;
    this.toSearchHouse = this.toSearchHouse.bind(this);
    this.toAddDynamic = this.toAddDynamic.bind(this);
  }


  componentDidMount() {
    this.netInfo();
    // DeviceEventEmitter.emit('AllDynamicList');
    this.HouseChoiceDevice = DeviceEventEmitter.addListener('HomeDynamicChoiceDevice', (item) => {
      this.setState({
        houseId: item.id,
        houseName: item.name,
        showScrollableAll: true,
        showScrollableMine: false,
        tabIndex: 0,
        isDynamicTypeArr: ['AllDynamicList'],
      }, () => {
        DeviceEventEmitter.emit('AllDynamicList');
      });
    });
    this.AddAndEmitDynamicDevice = DeviceEventEmitter.addListener('AddAndEmitDynamicDevice', () => {
      this.setState({
        tabIndex: 0,
        showScrollableAll: true,
        showScrollableMine: false,
        isDynamicTypeArr: ['AllDynamicList'],
      }, () => {
        DeviceEventEmitter.emit('AllDynamicList');
      });
    });
  }


  componentWillUnmount() {
    this.HouseChoiceDevice.remove();
    this.AddAndEmitDynamicDevice.remove();
  }


  // 点击tab时触发的事件
  onHouseTabEvent() {
    const { showScrollableAll, showScrollableMine } = this.state;
    this.setState({
      showScrollableAll: !showScrollableAll,
      showScrollableMine: !showScrollableMine,
    });
  }

  onHouseTabEventDown() {
    const { showScrollableAll } = this.state;
    if (showScrollableAll) {
      DeviceEventEmitter.emit('AllDynamicList');
    } else {
      DeviceEventEmitter.emit('MyDynamicList');
    }
  }

  onScrollBeginDrag = (event) => {
    // event.nativeEvent.contentOffset.x表示x轴滚动的偏移量
    if (system.isIOS) {
      this.scrollViewStartOffsetX = event.nativeEvent.contentOffset.x;
      this.scrollViewStartOffsetY = event.nativeEvent.contentOffset.y;
    } else {
      this.scrollViewStartOffsetX = event.nativeEvent.velocity.x;
      this.scrollViewStartOffsetY = event.nativeEvent.velocity.y;
    }
  };


  onScrollEndDrag = (event) => {
    if (system.isIOS) {
      this.scrollViewEndOffsetX = event.nativeEvent.contentOffset.x;
      this.scrollViewEndOffsetY = event.nativeEvent.contentOffset.y;
      const distinctX = this.scrollViewEndOffsetX - this.scrollViewStartOffsetX;
      const distinctY = this.scrollViewEndOffsetY - this.scrollViewStartOffsetY;
      if (distinctX < -30) {
        // 手势往左滑动，ScrollView组件往左滚动
        console.log('手势往左滑动，ScrollView组件往左滚动');
        this.onHouseTabEvent();
      } else if (distinctX > 30) {
        // 手势往右滑动，ScrollView组件往右滚动
        console.log('手势往右滑动，ScrollView组件往右滚动');
        this.onHouseTabEvent();
      }
    } else {
      this.scrollViewEndOffsetX = event.nativeEvent.velocity.x;
      this.scrollViewEndOffsetY = event.nativeEvent.velocity.y;
      const distinctX = this.scrollViewEndOffsetX - this.scrollViewStartOffsetX;
      const distinctY = this.scrollViewEndOffsetY - this.scrollViewStartOffsetY;
      if (distinctX < 0 && Math.abs(distinctX) > Math.abs(distinctY)) {
        console.log('手势往左滑动，ScrollView组件往左滚动');
        this.onHouseTabEvent();
      } else if (distinctX > 0 && Math.abs(distinctX) > Math.abs(distinctY)) {
        console.log('手势往右滑动，ScrollView组件往右滚动');
        this.onHouseTabEvent();
      }
      if (distinctY > 0 && Math.abs(distinctY) > Math.abs(distinctX)) {
        console.log('手势往下滑动，ScrollView组件往下滚动');
        this.onHouseTabEventDown();
      }
    }
  };
  // 判断网络状态
  netInfo() {
    if (Platform.OS === 'ios') {
      const connectionHandler = (connectionInfo) => {
        NetInfo.removeEventListener('connectionChange', connectionHandler);
      };
      NetInfo.addEventListener('connectionChange', (connectionHandler) => connectionHandler.types);
    }
  }
  // 点击动态跳转
  toSearchHouse() {
    const { props } = this;
    props.navigation.navigate('SearchHouse', {
      returnpageName: 'TabHome',
      deviceEventName: 'HomeDynamicChoiceDevice',
    });
  }

  toAddDynamic() {
    const { props } = this;
    props.navigation.navigate('AddDynamic');
  }


  render() {
    const {
      houseId,
      houseName,
      showScrollableAll,
      showScrollableMine,
    } = this.state;
    return (
      <View style={styles.container}>
        <View style={[baseStyles.borderBottomHair, styles.headerTitle]}>
          {
            houseName !== '楼盘动态' ?
              <TouchableOpacity
                style={{ width: 30, marginLeft: 10 }}
                onPress={() => {
                  this.setState({
                    houseId: null,
                    houseName: '楼盘动态',
                    showScrollableAll: true,
                    showScrollableMine: false,
                  }, () => {
                    DeviceEventEmitter.emit('AllDynamicList');
                  });
                }}
              >
                <Icon name="navigate-go-back" size={18} color="#333" />
              </TouchableOpacity>
              : null
          }
          <Text style={[baseStyles.text18, baseStyles.black, {
            width: houseName !== '楼盘动态' ? screen.width - 110 : screen.width,
            textAlign: 'center',
            justifyContent: 'center',
            alignItems: 'center',
          }]}
          >
            {houseName}
          </Text>
          <View
            style={{
              position: 'absolute',
              width: 70,
              height,
              top: paddingTop / 2,
              right: 10,
              zIndex: 5,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TouchableOpacity
              onPress={this.toAddDynamic}
              style={{ flex: 1, width: 35, height: 50, alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon name="bianji1" size={16} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, width: 35, height: 50, marginLeft: 5, alignItems: 'center', justifyContent: 'center' }}
              onPress={this.toSearchHouse}
            >
              <Icon name="sousuo1" size={16} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ width: screen.width, flex: 1 }}>
          <View
            style={{
              width: screen.width - 120,
              height: 55,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginHorizontal: 60,
            }}
          >
            <TouchableOpacity
              style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }]}
              onPress={() => { this.onHouseTabEvent(); }}
            >
              <Text style={[styles.houseTypeTab, showScrollableAll ? styles.houseTypeTabCurrent : null]}>全部动态</Text>
              <View style={[showScrollableAll ? styles.lineStyle : null]} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }]}
              onPress={() => { this.onHouseTabEvent(); }}
            >
              <Text style={[styles.houseTypeTab, showScrollableMine ? styles.houseTypeTabCurrent : null]}>我发布的</Text>
              <View style={[showScrollableMine ? styles.lineStyle : null]} />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            scrollEventThrottle={16}
            onScrollBeginDrag={this.onScrollBeginDrag}
            onScrollEndDrag={this.onScrollEndDrag}
          >
            {
              showScrollableAll ? (
                <FlatListPackage
                  tabLabel="全部状态"
                  ChildItem={DynamicItem}
                  path="/gardenDynimic/list"
                  transform={(res) => {
                    const { items } = res.data.result;
                    return items;
                  }}
                  style={{ flex: 1 }}
                  emitName="AllDynamicList"
                  params={
                    {
                      pageSize: 10,
                      type: 0,
                      expandId: houseId,
                    }
                  }
                />
              ) :
                null
            }
            {
              showScrollableMine ?
                (
                  <FlatListPackage
                    tabLabel="我发布的"
                    ChildItem={DynamicItem}
                    path="/gardenDynimic/list"
                    transform={(res) => {
                      const { items } = res.data.result;
                      return items;
                    }}
                    emitName="MyDynamicList"
                    params={
                      {
                        pageSize: 10,
                        type: 1,
                        expandId: houseId,
                      }
                    }
                  />
                )
                : null
            }
          </ScrollView>
        </View>
      </View >
    );
  }
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  headerTitle: {
    width: '100%',
    height,
    paddingTop,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  lineStyle: {
    width: 70,
    height: 2,
    backgroundColor: '#ff9911',
  },
  houseTypeTabBorder: {
    width: 50,
    height: 2,
    borderBottomColor: '#ff9911',
    borderBottomWidth: 2,
  },
  houseTypeTab: {
    fontSize: 15,
    color: '#CCCCCC',
    textAlign: 'center',
    paddingBottom: 15,
  },
  houseTypeTabCurrent: {
    fontSize: 15,
    color: '#000000',
  },
});
export default withNavigation(HomeDynamicList);
