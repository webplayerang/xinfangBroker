import React, { PureComponent } from 'react';
import {
  StyleSheet,
  View,
  Text,
  DeviceEventEmitter,
} from 'react-native';
import UltimateListView from 'react-native-ultimate-listview';
import PropTypes from 'prop-types';
import axios from 'axios';
import StatusView from './StatusView';
import { system, screen } from '../utils';

export default class ReportManage extends PureComponent {
  static propTypes = {
    ChildItem: PropTypes.func.isRequired, // 传入的item组件样式
    path: PropTypes.string.isRequired, // 传入的请求路径
    transform: PropTypes.func.isRequired, // 传入的数据数据路径
    emitName: PropTypes.string, // DeviceEventEmitter使用的emitName,方别在别的页面回调刷新
    params: PropTypes.shape({
    }), // 传入的请求参数对象
  }
  static defaultProps = {
    emitName: '',
    params: {},
  };
  constructor(props) {
    super(props);
    this.state = {
    };
    this.page = 1;
    this.onFetch = this.onFetch.bind(this);
    this.setItem = this.setItem.bind(this);
    this.setDeviceEventEmitter = this.setDeviceEventEmitter.bind(this);
  }
  componentDidMount () {
    this.setDeviceEventEmitter();
  }
  componentWillUnmount () {
    this.listenerList.remove();
  }
  // UltimateListView内部封装的列表请求，可自动更新page，成功更新列表数据等操作
  async onFetch (page = 1, startFetch, abortFetch) {
    try {
      this.page = page;
      const items = await this.requestData();
      // console.log(items);
      startFetch(items, 5);
    } catch (err) {
      abortFetch();
    }
  }
  setDeviceEventEmitter () {
    const { emitName } = this.props;
    // 可以在外部传递参数emitName进行列表刷新操作
    if (emitName === '') { return; }
    this.listenerList = DeviceEventEmitter.addListener(emitName, () => {
      this.listView.refresh();
    });
  }
  // 传递进来的childItem进项包装传参
  setItem (item, key) {
    const { ChildItem } = this.props;
    return (
      <ChildItem item={item} index={key} />
    );
  }
  // 封装请求函数方便多处调用，路径、参数都可传递
  requestData () {
    const {
      path, params, transform,
    } = this.props;
    return axios.get(path, {
      params:
      {
        pageNo: this.page,
        ...params,
      },
    }).then((res) => {
      if (res.data.status === 'C0000') {
        // 外部传入的回调函数，外部可获取到组件内请求到的数据进行后续操作
        return transform(res);
      }
      return [];
    }).catch((err) => {
      console.info(err);
    });
  }


  render () {
    return (
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
        item={this.setItem}
        numColumns={1}
        pagination
        autoPagination
        paginationAllLoadedView={() => (
          <View style={[styles.pageAllLoad]}>
            <Text style={{ color: '#7e7e7e' }}>没有更多数据了</Text>
          </View>)}
        emptyView={() => (
          <View style={[styles.pageAllLoad]}>
            <Text style={{ color: '#7e7e7e' }}>没有更多数据了</Text>
          </View>
        )}
        paginationWaitingView={() => (<StatusView />)}
      />
    );
  }
}

const styles = StyleSheet.create({
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
