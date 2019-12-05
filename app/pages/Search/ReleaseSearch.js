import React, { PureComponent } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  InteractionManager,
  Keyboard,
} from 'react-native';
import SearchView from '../../components/SearchView/SearchView';
import ReleaseListItem from '../MyReleaseManage/ReleaseListItem';

export default class ReleaseSearch extends PureComponent {
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
    // 跳转发布详情页
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate('MyReleaseDetail', { reportId: item.id, expandName: item.expandName });
    });
  }

  renderItem(item) {
    return (
      <TouchableOpacity
        onPress={() => { this.onSelect(item); }}
      >
        <ReleaseListItem item={item} />
      </TouchableOpacity>

    );
  }


  render() {
    // const { params = {} } = this.props.navigation.state;
    return (
      <SearchView
        // itemKey="expandId"
        // itemValue="gardenName"
        placeholderText="输入楼盘名称搜索"
        url="expand/report/myReportPagination"
        params={{ pageSize: 30 }}
        // historyKey="reportList"
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

const styles = StyleSheet.create({

});
