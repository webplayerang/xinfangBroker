import React, { PureComponent } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
  InteractionManager,
  Keyboard,
} from 'react-native';
import SearchView from '../../components/SearchView/SearchView';
import Icon from '../../components/Icon/';
import LatestReportRenderItem from '../Home/LatestReportRenderItem';

export default class ReportListSearch extends PureComponent {
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
    // 跳转报备详情页
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate('ReportDetail', { expandId: item.expandId });
    });
  }
  reportState(item) {
    return (
      <View>
        <Text style={styles.reportStateTxt}>{item.statusDesc}</Text>
      </View>
    );
  }
  phoneIcon(item) {
    return (
      <TouchableOpacity
        onPress={() => {
          Linking.canOpenURL(`tel:${item.brokerPhone}`).then((supported) => {
            if (!supported) {
              Alert.alert('当前版本不支持拨打号码');
            } else {
              Linking.openURL(`tel:${item.phone}`);
            }
          }).catch((err) => console.log(`未知错误${err}`));
        }}
      >
        <Icon name="dianhua" size={20} color="#4ed5a4" />
      </TouchableOpacity>
    );
  }
  renderItem(item) {
    return (
      <TouchableOpacity onPress={() => { this.onSelect(item); }} >
        <LatestReportRenderItem
          item={item}
          navigation={this.props.navigation}
          reportState={this.reportState(item)}
          phoneIcon={this.phoneIcon(item)}
        />
      </TouchableOpacity>
    );
  }


  render() {
    const { params = {} } = this.props.navigation.state;
    return (
      <SearchView
        itemKey="expandId"
        itemValue="gardenName"
        placeholderText="经纪人/客户/客户手机"
        url="reservation/reservationList"
        params={{ pageSize: 30, expandId: params.expandId, saleType: params.saleType }}
        historyKey="reportList"
        renderItem={this.renderItem}
        onSelect={this.onSelect}
        transform={(data) => {
          let items = [];
          if (data.result.items.items.length > 0) {
            items = data.result.items.items;
          }
          return items;
        }}
        {...this.props}
      />
    );
  }
}

const styles = StyleSheet.create({
  reportStateTxt: {
    color: '#ffc601',
    fontSize: 16,
  },
});
