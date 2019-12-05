import React, { PureComponent } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  InteractionManager,
  DeviceEventEmitter,
} from 'react-native';
import UltimateListView from 'react-native-ultimate-listview';
import axios from 'axios';
import Icon from '../../components/Icon/';
import GoBack from '../../components/GoBack';
import ReleaseListItem from './ReleaseListItem';
import StatusView from '../../components/StatusView';
import BaseStyles from '../../style/BaseStyles';
import { system, screen } from '../../utils';
import { UMNative } from '../../common/NativeHelper';

export default class MyReleaseManage extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerTitle: '我的发布',
      headerRight: (
        <TouchableOpacity
          style={{ paddingRight: 15 }}
          onPress={() => {
            navigation.navigate('ReleaseSearch');
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
      // username: '',
      // listAdv: '',
      // appUrl: '',
    };
    this.onFetch = this.onFetch.bind(this);
    this.releaseRenderItem = this.releaseRenderItem.bind(this);
    this.getListAdv = this.getListAdv.bind(this);
  }

  componentDidMount () {
    // UMNative.onEvent('REPORT_MANAGE_COUNT');
    // UMNative.onPageBegin('REPORT_MANAGER');
    this.listener = DeviceEventEmitter.addListener('RefreshReleaseList', () => {
      this.listView.refresh();
    });
    // this.getListAdv();
  }

  componentWillUnmount () {
    // UMNative.onPageEnd('REPORT_MANAGER');
    this.listener.remove();
  }

  async onFetch (page = 1, startFetch, abortFetch) {
    try {
      this.params.page = page;
      const res = await this.requestData();
      startFetch(res, 10);
    } catch (err) {
      abortFetch();
    }
  }

  onSelect (item) {
    // 跳转发布详情页

    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate('MyReleaseDetail', { reportId: item.id, expandName: item.expandName });
    });
  }


  getListAdv () {
    axios.get('/ad/getAdByPostion', {
      params: {
        brokerAppPosition: 'ListPage',
      },
    }).then((res) => {
      if (res.data.status === 'C0000' && res.data.result.picFdfsUrls.length > 0) {
        this.setState({
          listAdv: res.data.result.picFdfsUrls[0].replace('{size}', '750x150'),
          appUrl: res.data.result.appUrl,
        });
      }
    });
  }

  requestData () {
    return axios.get('expand/report/myReportPagination', { params: { pageSize: 10, page: this.params.page } })
      .then((res) => {
        if (res.data.status === 'C0000') {
          return res.data.result.items;
        }
        return [];
      })
      .catch(() => []);
  }

  params = { page: 1 }

  releaseRenderItem (item) {
    return (
      <TouchableOpacity
        onPress={() => { this.onSelect(item); }}
      >
        <ReleaseListItem item={item} />
      </TouchableOpacity>

    );
  }
  render () {
    return (
      <View style={[BaseStyles.container, { paddingTop: 10 }]}>
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
          item={this.releaseRenderItem}
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
});
