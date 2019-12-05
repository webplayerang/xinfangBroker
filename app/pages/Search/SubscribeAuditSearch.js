import React, { PureComponent } from 'react';
import {
  View,
  TouchableOpacity,
  Keyboard,
  InteractionManager,
} from 'react-native';
import OtherSearchView from '../../components/OtherSearchView/SearchView';
import SubscribeAuditItem from '../ProjectApproval/SubscribeAuditItem';

export default class SubscribeAuditSearch extends PureComponent {
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
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate('SubscribeAuditDetail', item);
    });
  }


  renderItem(item) {
    return (
      <TouchableOpacity
        style={{ paddingTop: 10, backgroundColor: '#f5f5f9' }}
        onPress={() => { this.onSelect(item); }}
      >
        <View style={{ backgroundColor: '#fff' }}>
          <SubscribeAuditItem
            item={item}
            navigation={this.props.navigation}
          />
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <OtherSearchView
        itemKey="subscribeAuditKey"
        itemValue="subscribeAuditVal"
        placeholderText="成交编号/楼盘名称"
        url="appSubscribe/getPrepareSubscribes"
        params={{ pageSize: 30 }}
        historyKey="subscribeAuditList"
        renderItem={this.renderItem}
        onSelect={this.onSelect}
        transform={(data) => {
          let items = [];
          if (data.subscribes.length > 0) {
            items = data.subscribes;
          }
          return items;
        }}
        {...this.props}
      />
    );
  }
}

