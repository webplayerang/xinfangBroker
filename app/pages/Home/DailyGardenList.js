import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  FlatList,
  DeviceEventEmitter,
} from 'react-native';
import axios from 'axios';
import DailyGardenRenderItem from './DailyGardenRenderItem';

export default class DailyGardenList extends PureComponent {
  // static propTypes = {
  //   navigation: PropTypes.objectOf,
  // }
  // static defaultProps = {
  //   navigation: null,
  // }
  constructor(props) {
    super(props);
    this.state = {
      flatListHeight: 115,
      dailyGardenData: [],
    };
    this.dailyGardenRenderItem = this.dailyGardenRenderItem.bind(this);
  }
  componentDidMount () {
    this.listener = DeviceEventEmitter.addListener('DailyGardenList', () => {
      this.requestDailyGardenData();
    });
    this.requestDailyGardenData();
  }

  componentWillUnmount () {
    this.listener.remove();
  }

  async requestDailyGardenData () {
    // 根据storage永久储存的楼盘拓展id 获取数据
    // 如果没有储存id，则常看楼盘为空
    const username = await global.storage.load({ key: 'userInfo' })
      .then((res) => res.username);
    const expandIds = await global.storage.load({ key: `dailyGardenExpandId${username}` })
      .then((res) => res.join(','))
      .catch(() => '');
    if (expandIds) {
      axios.get('reservation/reservationGardenList', { params: { expandIds } })
        .then((res) => {
          if (res.data.status !== 'C0000') {
            return;
          }
          const data = res.data.result.items;
          const len = data.length;
          if (len <= 4) {
            this.setState({
              dailyGardenData: data,
            });
            return;
          }
          data.splice(4, len - 4);
          this.setState({
            dailyGardenData: data,
          });
        });
    } else {
      axios.get('reservation/reservationGardenList')
        .then((res) => {
          if (res.data.status !== 'C0000') {
            return;
          }
          const data = res.data.result.items;
          const len = data.length;
          if (len <= 4) {
            this.setState({
              dailyGardenData: data,
            });
            return;
          }
          data.splice(4, len - 4);
          this.setState({
            dailyGardenData: data,
          });
        });
    }
    // return {};
  }

  dailyGardenRenderItem (data) {
    return (
      <DailyGardenRenderItem
        item={data.item}
        navigation={this.props.navigation}
      />
    );
  }

  render () {
    return (
      <View style={{ flex: 1 }}>
        {
          this.state.dailyGardenData.length ?
            <FlatList
              data={this.state.dailyGardenData}
              renderItem={this.dailyGardenRenderItem}
              keyExtractor={(item, index) => index.toString()}
            />
            :
            null
        }
      </View>

    );
  }
}

