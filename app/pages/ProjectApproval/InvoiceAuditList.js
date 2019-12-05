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
import axiosErp from '../../common/AxiosInstance';
import Icon from '../../components/Icon/';
import GoBack from '../../components/GoBack';
import InvoiceAuditItem from './InvoiceAuditItem';
import StatusView from '../../components/StatusView';
import { system, screen } from '../../utils';
import { UMNative } from '../../common/NativeHelper';
import BaseStyles from '../../style/BaseStyles';

export default class InvoiceAuditList extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerTitle: '开票申请',
      headerLeft: (
        <GoBack
          navigation={navigation}
        />
      ),
      headerRight: (<Text />),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      listData: [],
    };
    this.onFetch = this.onFetch.bind(this);
    this.renderItem = this.renderItem.bind(this);
  }

  componentDidMount () {
    this.listener = DeviceEventEmitter.addListener('InvoiceAuditList', () => {
      this.listView.refresh();
    });
  }

  componentWillUnmount () {
    this.listener.remove();
  }

  async onFetch (page = 1, startFetch, abortFetch) {
    try {
      this.params.page = page;
      const res = await this.requestData();

      startFetch(res, 10000);
    } catch (err) {
      abortFetch();
    }
  }


  params = { page: 1 }

  requestData () {
    return axiosErp.instance.get('appInvoiceBill/getPrepareInvoiceBills', { params: this.params || {} })
      .then((res) => res.data.invoiceBills)
      .catch(() => []);
  }

  // 跳转路由 公共方法
  navigateTo (route, params = {}) {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }


  renderItem (item) {
    return (
      <TouchableOpacity
        onPress={() => {
          this.navigateTo('InvoiceAuditDetail', item);
        }
        }
      >
        <InvoiceAuditItem item={item} />
      </TouchableOpacity>

    );
  }
  render () {
    return (
      <View style={BaseStyles.container}>
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
          pagination={false}
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
