import React, { PureComponent } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  InteractionManager,
} from 'react-native';
import axios from 'axios';
import UltimateListView from 'react-native-ultimate-listview';
import StatusView from '../../components/StatusView';
import BaseStyles from '../../style/BaseStyles';
import DealGardenItem from './DealGardenItem';
import { system, screen } from '../../utils';

export default class RecognizeGardenList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      RecognizeStateColor: [],
    };
    this.page = 1;
    this.onFetch = this.onFetch.bind(this);
    this.renderItem = this.renderItem.bind(this);
  }

  async onFetch (page = 1, startFetch, abortFetch) {
    try {
      this.page = page;
      const res = await this.requestData();
      startFetch(res, 10);
    } catch (err) {
      abortFetch();
    }
  }
  onSelect = (item) => {
    const subscribeId = item.id;

    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate('DealDetail', { subscribeId });
    });
  }
  getData (gardenErpId, status, page) {
    return axios.get('subscribe/listData', { params: { gardenErpId, status, page } })
      .then((res) => {
        if (res.data.status === 'C0000') {
          const data = res.data.result.items;
          this.setState({
            RecognizeStateColor: data.map((val) => val.depositStatus),
          });
          return data;
        }
        return [];
      }).catch(() => []);
  }

  requestData () {
    const { status } = this.props;
    const expandId = this.props.navigation.state.params.expandId;
    if (!status) {
      return this.getData(expandId, status, this.page);
    }
    return this.getData(expandId, status, this.page);
  }

  // 传给renderItem的成交状态element
  dealState (item) {
    const status = item.settleStatusDesc;
    if (status === '部分结算') {
      return (
        <Text style={[BaseStyles.text16, BaseStyles.yellow]}>{status}</Text>
      );
    } else if (status === '待结算') {
      return (
        <Text style={[BaseStyles.text16, BaseStyles.red]}>{status}</Text>
      );
    } else if (status === '已结算') {
      return (
        <Text style={[BaseStyles.text16, BaseStyles.green]}>{status}</Text>
      );
    }
    return null;
  }

  // 传给renderItem的待结算状态描述element
  dealStatusDesc (item) {
    const dealStatusDesc = item.dealStatusDesc;
    if (dealStatusDesc === '已上数') {
      return null;
    }
    return (
      <Text style={[BaseStyles.text16, BaseStyles.red, { paddingRight: 20 }]}>{dealStatusDesc}</Text>
    );
  }

  renderItem (item) {
    return (
      <TouchableOpacity
        onPress={() => { this.onSelect(item); }}
      >
        <DealGardenItem
          item={item}
          navigation={this.props.navigation}
          dealState={this.dealState(item)}
          dealStatusDesc={this.dealStatusDesc(item)}
        />
      </TouchableOpacity>
    );
  }

  render () {
    return (
      <View style={styles.newEstateBox}>
        <UltimateListView
          header={() => this.props.header}
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
  },
});
