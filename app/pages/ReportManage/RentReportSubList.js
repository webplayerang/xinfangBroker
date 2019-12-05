import React, { PureComponent } from 'react';
import {
  View,
  Text,
  InteractionManager,
  TouchableOpacity,
  StyleSheet,
  Image,
  DeviceEventEmitter,
} from 'react-native';
import axios from 'axios';
import UltimateListView from 'react-native-ultimate-listview';
import StatusView from '../../components/StatusView';
import GardenRenderItem from './GardenRenderItem';
import { system, screen } from '../../utils';

export default class RentReportSubList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.developCompanyPhone = '';
    this.page = 1;
    this.onFetch = this.onFetch.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.params = {
      page: 1,
      saleType: props.saleType,
    };
  }

  async onFetch (page = 1, startFetch, abortFetch) {
    try {
      this.params.page = page;
      const res = await this.requestData();

      startFetch(res.items, 5);
    } catch (err) {
      abortFetch();
    }
  }

  async onSelect (item, saleType) {
    const username = await global.storage.load({ key: 'userInfo' })
      .then((res) => res.username);
    // 储存常看楼盘id时+username，区分一个手机多个帐号登录
    const dailyGardenId = await global.storage.load({
      key: `dailyGardenExpandId${username}`,
    }).then((res) => {
      res = res.filter((val) => val !== item.expandId);
      if (res.length < 4) {
        res.push(item.expandId);
      } else {
        res.shift();
        res.push(item.expandId);
      }
      return res;
    }).catch(() => [item.expandId]);

    global.storage.save({
      key: `dailyGardenExpandId${username}`,
      data: dailyGardenId,
      expires: null,
    });
    // 刷新DailyGardenList
    DeviceEventEmitter.emit('DailyGardenList');
    // 跳转楼盘详情页
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate('PersonalReportList', {
        expandId: item.expandId,
        gardenName: item.gardenName,
        putawayStatus: item.putawayStatus,
        saleType,
      });
    });
  }

  // getListAdv() {
  //   axios.get('/ad/getAdByPostion', {
  //     params: {
  //       brokerAppPosition: 'ListPage',
  //     },
  //   }).then((res) => {
  //     if (res.data.status === 'C0000' && res.data.result.picFdfsUrls.length > 0) {
  //       this.setState({
  //         listAdv: res.data.result.picFdfsUrls[0].replace('{size}', '750x150'),
  //         appUrl: res.data.result.appUrl,
  //       });
  //     }
  //   });
  // }

  requestData () {
    return axios.get('reservation/reservationGardenList',
      {
        params: this.params || {},
      })
      .then((res) => {
        if (res.data.status === 'C0000') {
          return res.data.result;
        }
        return { items: [] };
      })
      .catch(() => ({ items: [] }));
  }

  renderItem (item) {
    return (
      <TouchableOpacity
        onPress={() => { this.onSelect(item, this.params.saleType); }}
      >
        <GardenRenderItem item={item} />
      </TouchableOpacity>
    );
  }

  render () {
    return (
      <View style={styles.newEstateBox}>
        <UltimateListView
          // header={() => (this.state.listAdv ?
          //   <TouchableOpacity
          //     onPress={() => {
          //       if (this.state.appUrl) {
          //         this.props.navigation.navigate('ViewPage', { url: this.state.appUrl });
          //       }
          //     }}
          //   >
          //     <Image style={styles.image} source={{ uri: this.state.listAdv }} />
          //   </TouchableOpacity>
          //   : null
          // )}
          refreshable
          refreshableMode={system.isIOS ? 'advanced' : 'basic'}
          refreshableTitlePull="下拉刷新"
          refreshableTitleRelease="释放加载"
          refreshableTitleRefreshing="加载中"
          displayDate
          dateTitle="上次加载时间："
          onFetch={this.onFetch}
          ref={(ref) => { this.listView = ref; }}
          keyExtractor={(item, index) => index.toString()}
          item={this.renderItem}
          numColumns={1}
          pagination
          autoPagination
          paginationFetchingView={() => (
            <View style={styles.center}>
              <StatusView styles={{ backgroundColor: '#fff' }} />
              <Text style={{ color: '#7e7e7e', marginLeft: 10, fontSize: 14 }}>
                加载中
              </Text>
            </View>
          )}
          emptyView={() => (
            <View style={[styles.pageAllLoad]}>
              <Text style={{ color: '#7e7e7e' }}>暂无数据</Text>
            </View>
          )}
          paginationAllLoadedView={() => (
            <View style={[styles.pageAllLoad]}>
              <Text style={{ color: '#7e7e7e' }}>没有更多数据了</Text>
            </View>
          )}
          paginationWaitingView={() => (<StatusView />)}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  newEstateBox: {
    backgroundColor: '#fff',
    zIndex: 1,
    flex: 1,
    paddingBottom: system.isIOS ? 0 : 20,
  },
  noDataTipStyle: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 40,
  },
  center: {
    height: screen.height - 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageAllLoad: {
    backgroundColor: '#fff',
    width: screen.width,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  listImg: {
    width: '100%',
    height: '100%',
    // resizeMode: 'cover'
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: screen.width,
    height: 150,
    resizeMode: 'cover',
  },
  pageView: {
    backgroundColor: '#fff',
    zIndex: 1,
    flex: 1,
  },
});
