import React, { PureComponent } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  InteractionManager,
} from 'react-native';
import SearchView from '../../components/SearchView/SearchView';
import RecognizeGardenItem from '../RecognizeManage/RecognizeGardenItem';
import BaseStyles from '../../style/BaseStyles';

export default class RecognizeSearch extends PureComponent {
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
    // 跳转认筹详情
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate('RecoginzeDetail', { recognitionId: item.id });
    });
  }
  // 传给renderItem的认筹状态element
  RecognizeState(item) {
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
  renderItem(item) {
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


  render() {
    return (
      <SearchView
        itemKey="recognizeKey"
        itemValue="recognizeVal"
        placeholderText="经纪人/客户/客户手机/楼盘名称"
        url="recognition/listData"
        params={{ pageSize: 30 }}
        historyKey="recognizeList"
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

