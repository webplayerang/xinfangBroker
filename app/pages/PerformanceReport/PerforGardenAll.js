

import React, { PureComponent } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  InteractionManager,
} from 'react-native';
import UltimateListView from 'react-native-ultimate-listview';
import axios from 'axios';
import Toast from 'react-native-easy-toast';

import Icon from '../../components/Icon/';
import StatusView from '../../components/StatusView';
import GoBack from '../../components/GoBack';
import { screen, system } from '../../utils';
import HeaderTitle from '../../components/SelectTitle/HeaderTitle';
import SelectDialog from '../../components/SelectTitle/SelectDialog';
import GardenRenderItem from './GardenRenderItem';


export default class PerforGardenAll extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    const headerTitle = (params.who === 'WHOLE_CITY' && params.filterData.length === 1) || params.flag ?
      (
        <View style={system.isIOS ? {} : { width: '100%', alignItems: 'center' }}>
          <Text style={{
            fontWeight: 'normal',
            color: '#3a3a3a',
            fontSize: 18,
          }}
          >{params.defaultTitle}</Text>
        </View>
      )
      :
      (
        <HeaderTitle params={params} />
      );

    return {
      headerTitle,
      headerRight: (
        <TouchableOpacity
          style={{ paddingRight: 15 }}
          onPress={() => {
            navigation.navigate('PerforGardenSearch', {
              orgunitId: navigation.state.params.orgunitId,
              serverDate: navigation.state.params.serverDate,
            });
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
    };
    this.filterParams = {
      page: 1,
      orgunitId: this.props.navigation.state.params.orgunitId,
    };
    this.onFetch = this.onFetch.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  async onFetch (page = 1, startFetch, abortFetch) {
    try {
      this.filterParams.page = page;
      const res = await this.requestData();
      startFetch(res.items, 10);
    } catch (err) {
      abortFetch();
    }
  }

  onSelect (item) {
    const params = this.props.navigation.state.params; // state对象内的params内部还有一层params；
    Object.assign(params, item);
    // 跳转成交详情
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate('GardenPerformance', params);
    });
  }

  filterDo (val) {
    if (val) {
      this.filterParams.orgunitId = val.id;
      this.listView.refresh();
    }
  }

  requestData () {
    return axios.get('companyStatistics/getGardenPagination',
      { params: { orgunitId: this.filterParams.orgunitId, pageSize: 10, page: this.filterParams.page } || {} })
      .then((res) => {
        if (res.data.status === 'C0000') {
          return res.data.result;
        }
        return { items: [] };
      }).catch(() => ({ items: [] }));
  }

  renderItem (item) {
    return (
      <TouchableOpacity
        onPress={() => {
          this.onSelect(item);
        }}
      >
        <GardenRenderItem item={item} />
      </TouchableOpacity >

    );
  }

  render () {
    const { navigation } = this.props;
    return (
      <View>
        <SelectDialog
          data={navigation.state.params.filterData}
          parent={this}
        />
        {/* 搜索框start */}
        {/* <View style={styles.searchBar} >
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('PerforGardenSearch',
                {
                  orgunitId: this.filterParams.orgunitId,
                  serverDate: this.props.navigation.state.params.serverDate,
                });
            }}
            style={styles.searchBox}
          >
            <View
              ref={(searchView) => { this.searchView = searchView; }}
              style={styles.searchView}
            >
              <Icon name="magnifier" size={18} color="#7e7e7e" style={{ marginLeft: 10 }} />
              <Text style={styles.searchText}>输入楼盘名称搜索</Text>
            </View>
          </TouchableOpacity>
        </View> */}
        {/* 搜索框end */}

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
          autoPagination
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
  searchBar: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#7e7e7e',

    backgroundColor: '#fff',
  },
  searchBox: {
    width: '92%',
  },
  searchView: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    backgroundColor: '#e1e1e1',
    borderRadius: 5,
  },
  searchText: {
    color: '#7e7e7e',
    marginLeft: 8,
    fontSize: 14,
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
});

