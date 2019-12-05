import React, { PureComponent } from 'react';
import {
  View,
  Text,
  Linking,
  Alert,
  TouchableOpacity,
  StyleSheet,
  DeviceEventEmitter,
} from 'react-native';
import axios from 'axios';
import UltimateListView from 'react-native-ultimate-listview';
import StatusView from '../../components/StatusView';
import Icon from '../../components/Icon/';
import LatestReportRenderItem from '../Home/LatestReportRenderItem';
import { system, screen } from '../../utils';

export default class PersonalReportSubList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.developCompanyPhone = '';
    this.page = 1;
    this.onFetch = this.onFetch.bind(this);
    this.renderItem = this.renderItem.bind(this);
  }
  componentDidMount () {
    this.listener = DeviceEventEmitter.addListener('PersonalReportList', () => {
      this.listView.refresh();
    });
  }

  componentWillUnmount () {
    this.listener.remove();
  }
  async onFetch (page = 1, startFetch, abortFetch) {
    try {
      this.page = page;
      const res = await this.requestData();
      startFetch(res, 15);
    } catch (err) {
      abortFetch();
    }
  }

  // getData(expandId, status, page, saleType) {
  //   return axios.get('reservation/reservationList', {
  //     params: {
  //       expandId,
  //       reservationGuideStatusEnum: status.status,
  //       page,
  //       saleType,
  //     },
  //   })
  //     .then((res) => {
  //       if (res.data.status === 'C0000') {
  //         const data = res.data.result.items.items;
  //         this.developCompanyPhone = res.data.result.developCompanyPhone;
  //         return data;
  //       }
  //       return [];
  //     }).catch(() => []);
  // }

  requestData () {
    const { status } = this.props;
    const { saleType, expandId } = this.props.navigation.state.params;
    return axios.get('reservation/reservationList', {
      params: {
        expandId,
        reservationGuideStatusEnum: status,
        page: this.page,
        saleType,
      },
    })
      .then((res) => {
        if (res.data.status === 'C0000') {
          const data = res.data.result.items.items;
          this.developCompanyPhone = res.data.result.developCompanyPhone;
          return data;
        }
        return [];
      }).catch(() => []);
    // return this.getData(expandId, status, this.page, saleType);
  }
  reportState (item) {
    return (
      <View>
        <Text style={styles.reportStateTxt}>{item.statusDesc}</Text>
      </View>
    );
  }
  phoneIcon (item) {
    return (
      <TouchableOpacity
        onPress={() => {
          Linking.canOpenURL(`tel:${item.brokerPhone}`)
            .then((supported) => {
              if (!supported) {
                Alert.alert('当前版本不支持拨打号码');
              } else {
                Linking.openURL(`tel:${item.brokerPhone}`);
              }
            })
            .catch((err) => console.log(`未知错误${err}`));
        }}
      >
        <Icon name="dianhua" size={26} color="#4ed5a4" />
      </TouchableOpacity>
    );
  }

  renderItem (item) {
    return (
      <View>
        <LatestReportRenderItem
          item={item}
          navigation={this.props.navigation}
          reportState={this.reportState(item)}
          phoneIcon={this.phoneIcon(item)}
        />
      </View>
    );
  }

  render () {
    return (
      <View style={styles.newEstateBox}>
        <UltimateListView
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
          paginationFetchingView={() => (
            <View style={styles.center}>
              <StatusView styles={{ backgroundColor: '#fff' }} />
              <Text style={{ color: '#7e7e7e', marginLeft: 10, fontSize: 14 }}>
                加载中
              </Text>
            </View>)}
          emptyView={() => (
            <View style={[styles.pageAllLoad]}>
              <Text style={{ color: '#7e7e7e' }}>暂无数据</Text>
            </View>
          )}
          paginationAllLoadedView={() => (
            <View style={[styles.pageAllLoad]}>
              <Text style={{ color: '#7e7e7e' }}>没有更多数据了</Text>
            </View>)}
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
    // paddingBottom: system.isIOS ? 0 : 20,
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
  },
  reportStateTxt: {
    color: '#ffc601',
    fontSize: 16,
  },
});
