import React, { PureComponent } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  InteractionManager,
  DeviceEventEmitter,
} from 'react-native';
import axios from 'axios';
import UltimateListView from 'react-native-ultimate-listview';
import StatusView from '../../components/StatusView';
import RecognizeGardenItem from './RecognizeGardenItem';
import { system, screen } from '../../utils';
import BaseStyles from '../../style/BaseStyles';

export default class RecognizeGardenList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    this.page = 1;
    this.onFetch = this.onFetch.bind(this);
    this.renderItem = this.renderItem.bind(this);
  }
  componentDidMount () {
    this.listener = DeviceEventEmitter.addListener('RecognizeManageList', () => {
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
      startFetch(res, 10);
    } catch (err) {
      abortFetch();
    }
  }
  onSelect = (item) => {
    const recognitionId = item.id;

    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate('RecoginzeDetail', { recognitionId });
    });
  }
  getData (gardenErpId, status, page) {
    return axios.get('recognition/listData', { params: { gardenErpId, status, page } })
      .then((res) => {
        if (res.data.status === 'C0000') {
          const data = res.data.result.items;
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
  // 传给renderItem的认筹状态element
  /*
  ** 区分颜色
  ** 红色 未开始
  ** 黄色 进行中
  ** 绿色 已完成
  */
  RecognizeState (item) {
    const status = item.depositStatusDesc;
    if (status === '退款中' || status === '部分退款') {
      return (
        <Text style={[BaseStyles.text16, BaseStyles.yellow]}>{status}</Text>
      );
    } else if (status === '未收齐') {
      return (
        <Text style={[BaseStyles.text16, BaseStyles.red]}>{status}</Text>
      );
    } else if (status === '已收齐' || status === '已退款') {
      return (
        <Text style={[BaseStyles.text16, BaseStyles.green]}>{status}</Text>
      );
    }
    return null;
  }

  renderItem (item) {
    return (
      <TouchableOpacity
        onPress={() => { this.onSelect(item); }}
      >
        <RecognizeGardenItem
          item={item}
          navigation={this.props.navigation}
          RecognizeState={this.RecognizeState(item)}
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
