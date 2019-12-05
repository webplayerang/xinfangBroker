import React, { PureComponent } from 'react';
import {
  View,
  TouchableOpacity,
  InteractionManager,
  DeviceEventEmitter,
  Keyboard,
} from 'react-native';
import SearchView from '../../components/SearchView/SearchView';
import GardenRenderItem from '../ReportManage/GardenRenderItem';

export default class GardenSearch extends PureComponent {
  static navigationOptions = {
    header: null,
  };
  constructor(props) {
    super(props);
    this.renderItem = this.renderItem.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }
  async onSelect(item) {
    Keyboard.dismiss();
    // global.storage.remove({
    //   key: 'dailyGardenExpandId',
    // });
    const dailyGardenId = await global.storage.load({
      key: 'dailyGardenExpandId',
    }).then((ret) => {
      ret = ret.filter((val) => val !== item.expandId);
      if (ret.length < 4) {
        ret.push(item.expandId);
      } else {
        ret.shift();
        ret.push(item.expandId);
      }
      return ret;
    }).catch(() => [item.expandId]);
    global.storage.save({
      key: 'dailyGardenExpandId',
      data: dailyGardenId,
      expires: null,
    });
    DeviceEventEmitter.emit('DailyGardenList');
    // 跳转楼盘详情页
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate('PersonalReportList', { expandId: item.expandId, gardenName: item.gardenName, putawayStatus: item.putawayStatus });
    });
  }
  renderItem(item) {
    return (
      <TouchableOpacity
        onPress={() => { this.onSelect(item); }}
      >
        <GardenRenderItem item={item} />
      </TouchableOpacity>
    );
  }


  render() {
    return (
      <SearchView
        itemKey="expandId"
        itemValue="gardenName"
        placeholderText="请输入楼盘名称"
        url="reservation/reservationGardenList"
        params={{ pageSize: 30, saleType: this.props.navigation.state.params.saleType }}
        historyKey="gardenList"
        renderItem={this.renderItem}
        onSelect={this.onSelect}
        transform={(data) => {
          let items = [];
          if (data.result.items.length > 0) {
            items = data.result.items;
          }
          return items;
        }}
        {...this.props}
      />
    );
  }
}

