// 收据号
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, PropTypes, DeviceEventEmitter } from 'react-native';
import UltimateListView from 'react-native-ultimate-listview';
import axios from 'axios';
import { screen } from '../utils/index';
import StatusView from '../components/StatusView';

export default class ReceiptNumber extends React.Component {
  params = { page: 1 };

  static navigationOptions = ({ navigation }) => ({
    title: navigation.state.params.title,
  });

  // static defaultProps = {
  //   navigation: {},
  // }mnbmnbvcnbvcxbvcxnbvn

  // static propTypes = {
  //   navigation: PropTypes.object,
  // }

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      isLoading: true,
    };
  }

  async onFetch (page, startFetch, abortFetch) {
    try {
      this.params.page = page || 1;
      const res = await this.requestData();
      startFetch(res.items, 15);
    } catch (err) {
      abortFetch();
    }
  }

  requestData () {
    const { params } = this.props.navigation.state;
    params.params.page = this.params.page;
    return axios.get(params.url, { params: params.params || {} }).then((res) => {
      if (res.data.status === 'C0000') {
        if (res.data.result.recordCount > 0) {
          this.setState({
            isLoading: false,
          });
        } else {
          this.setState({
            status: 'no-data-found',
            isLoading: false,
          });
        }
        return res.data.result;
      }
      this.setState({
        status: 'request-failed',
        isLoading: false,
      });
      return { items: [] };
    }).catch(() => {
      this.setState({
        status: 'network-error',
        isLoading: false,
      });
      return { items: [] };
    });
  }

  renderItem (item) {
    const { goBack } = this.props.navigation;
    const { params } = this.props.navigation.state;
    return (
      <TouchableOpacity
        style={styles.btn}
        key={item.id}
        onPress={() => {
          const { id = item, bookId = item } = item;
          const tmp = {
            id,
            bookId,
            type: params.type,
          };
          DeviceEventEmitter.emit(params.event, tmp);
          goBack();
        }}
      >
        <View style={{ flexDirection: 'row', marginBottom: 10 }}><Text style={styles.number}>收据号: </Text><Text style={[styles.text]}>{item.id}</Text></View>
        <View style={{ flexDirection: 'row' }}><Text style={styles.number}>收据本: </Text><Text style={[styles.text]}>{item.bookId}</Text></View>
      </TouchableOpacity>);
  }

  render () {
    const { goBack } = this.props.navigation;
    const { params } = this.props.navigation.state;
    return (
      <View style={styles.container}>
        <UltimateListView
          onFetch={this.onFetch.bind(this)}
          getItemLayout={(data, index) => ({ length: 132, offset: 132 * index, index })}
          keyExtractor={(item, index) => index.toString()}
          refreshable={false}
          item={this.renderItem.bind(this)}
          numColumns={1}
          pagination
          paginationFetchingView={() => (
            <View style={styles.center}>
              <StatusView />
            </View>
          )}
          emptyView={() => (
            <View style={[styles.noMoreData]}>
              <Text style={{ color: '#7e7e7e' }}>暂无数据</Text>
            </View>
          )}
          paginationAllLoadedView={() => (
            <View style={styles.noMoreData}>
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
  container: {
    paddingTop: 10,
    backgroundColor: '#f5f5f9',
    width: screen.width,
    height: screen.height,
  },
  noMoreData: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: screen.width,
    height: 40,
    borderBottomWidth: 0,
    backgroundColor: '#f5f5f9',
  },
  btn: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  nubmer: {
    fontSize: 16,
    color: '#7e7e7e',
  },
  text: {
    fontSize: 16,
    color: '#3a3a3a',
  },
  current: {
    color: '#ffc601',
  },
});
