

import React, { PureComponent } from 'react';
import {
  TouchableOpacity,
  Keyboard,
  InteractionManager,
} from 'react-native';
import SearchView from '../../components/SearchView/SearchView';
import GardenRenderItem from './GardenRenderItem';


export default class PerforGardenSearch extends PureComponent {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
    };
    this.filterParams = {
      orgunitId: '',
    };
    this.renderItem = this.renderItem.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  onSelect(item) {
    Keyboard.dismiss();

    const params = this.props.navigation.state.params;// state内部的params内还有一层params
    Object.assign(params, item);

    // 跳转成交详情
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate('GardenPerformance', params);
    });
  }

  renderItem(item) {
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

  render() {
    const { params } = this.props.navigation.state;
    return (
      <SearchView
        itemKey="PerformanceKey"
        itemValue="PerformanceVal"
        placeholderText="输入楼盘名称搜索"
        url="companyStatistics/getGardenPagination"
        params={{ pageSize: 30, orgunitId: params.orgunitId }}
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

