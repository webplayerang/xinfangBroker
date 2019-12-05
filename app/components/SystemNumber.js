// 系统参考号
import React from 'react';
import { View, Keyboard, Text, StyleSheet, TouchableOpacity, DeviceEventEmitter } from 'react-native';
import { screen } from '../utils/index';
import SearchView from '../components/SearchView/SearchView';

export default class SystemNumber extends React.Component {
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
    const { refNumber = refNumber } = item;
    const tmp = {
      refNumber,
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
        key={item.id}
      >
        <View style={styles.row}>
          <Text style={styles.number}>分公司: </Text>
          <Text style={[styles.strongText]}>{item.companyName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.number}>收款银行账号: </Text>
          <Text style={[styles.text]}>{item.bankNumber}</Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Text style={styles.number}>金额: </Text><Text style={[styles.text]}>{item.amount} 元</Text>
          <Text style={[styles.number, { marginLeft: 20 }]}>系统参考号: </Text><Text style={[styles.text]}>{item.refNumber}</Text>
        </View>
      </TouchableOpacity>);
  }

  render() {
    const { goBack } = this.props.navigation;
    const { params } = this.props.navigation.state;
    return (
      <View style={styles.container}>
        <SearchView
          placeholderText="请输入至少四位系统号"
          url={params.url}
          params={params.params}
          listStyle={{
            height: screen.height,
          }}
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
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: screen.height,
    paddingTop: 10,
    backgroundColor: '#f5f5f9',
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
  row: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  nubmer: {
    fontSize: 16,
    color: '#7e7e7e',
  },
  strongText: {
    fontSize: 16,
    color: '#3a3a3a',
    fontWeight: 'bold',
  },
  text: {
    fontSize: 14,
    color: '#3a3a3a',
  },
  current: {
    color: '#ffc601',
  },
});
