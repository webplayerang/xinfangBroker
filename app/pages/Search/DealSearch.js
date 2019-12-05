import React, { PureComponent } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  InteractionManager,
} from 'react-native';
import SearchView from '../../components/SearchView/SearchView';
import DealGardenItem from '../DealManage/DealGardenItem';
import BaseStyles from '../../style/BaseStyles';

export default class DealSearch extends PureComponent {
  static navigationOptions = {
    header: null,
  };
  constructor(props) {
    super(props);
    this.renderItem = this.renderItem.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }
  onSelect(item) {
    Keyboard.dismiss();
    // 跳转成交详情
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate('DealDetail', { subscribeId: item.id });
    });
  }
  // 传给renderItem的成交状态element
  dealState(item) {
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
  dealStatusDesc(item) {
    const dealStatusDesc = item.dealStatusDesc;
    if (dealStatusDesc === '已上数') {
      return null;
    }
    return (
      <Text style={[BaseStyles.text16, BaseStyles.red, { paddingRight: 20 }]}>{dealStatusDesc}</Text>
    );
  }
  renderItem(item) {
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

  render() {
    return (
      <SearchView
        itemKey="dealKey"
        itemValue="dealVal"
        placeholderText="经纪人/客户/客户手机/楼盘名称"
        url="subscribe/listData"
        params={{ pageSize: 30 }}
        historyKey="dealList"
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

