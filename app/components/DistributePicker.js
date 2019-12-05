// 分销人员选择器
import React from 'react';
import { View, Keyboard, Text, StyleSheet, TouchableOpacity, DeviceEventEmitter } from 'react-native';
import SearchView from '../components/SearchView/SearchView';
import { screen } from '../utils/index';

export default class DistributePicker extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    // title: navigation.state.params.title,
    header: null,
  });

  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
    this.renderItem = this.renderItem.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  onSelect(item) {
    Keyboard.dismiss();
    const { goBack } = this.props.navigation;
    const { params } = this.props.navigation.state;
    const { personId = personId, personName = personName } = item;
    const tmp = {
      personId,
      personName,
      type: params.type,
    };
    DeviceEventEmitter.emit(params.event, tmp);
    goBack();
  }

  renderItem(item) {
    return (
      <TouchableOpacity
        onPress={() => { this.onSelect(item); }}
        style={styles.btn}
        key={item.personId}
      >
        <View style={styles.row}>
          <Text style={styles.strongText}>{item.personName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.text]}>{item.companyName}</Text>
          <Text style={[styles.text]}>{item.storeName}</Text>
        </View>
      </TouchableOpacity>);
  }

  render() {
    const { goBack } = this.props.navigation;
    const { params } = this.props.navigation.state;
    return (
      <SearchView
        placeholderText="请输入名称"
        url={params.url}
        listStyle={{ height: screen.height }}
        renderItem={this.renderItem}
        params={params.params}
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
  btn: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e7e8ea',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  strongText: {
    fontSize: 16,
    color: '#3a3a3a',
    fontWeight: 'bold',
  },
  text: {
    fontSize: 14,
    color: '#a8a8a8',
    marginRight: 10,
  },
});
