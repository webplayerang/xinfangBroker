// 上数页面
import React, { PureComponent } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  DeviceEventEmitter,
  TouchableOpacity,
} from 'react-native';
import GoBack from '../../components/GoBack';
import BaseStyle from '../../style/BaseStyles';
import screen from '../../utils/screen';

class DynamicType extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: '动态类型',
    headerLeft: (
      <GoBack
        navigation={navigation}
        color="#333"
        size={20}
      />
    ),

  });
  constructor(props) {
    super(props);
    this.state = {
      list: [
        {
          typeStr: '楼盘动态',
          type: 't1',
        }, {
          typeStr: '成交喜报',
          type: 't2',
        }, {
          typeStr: '优惠活动',
          type: 't3',
        }, {
          typeStr: '奖励活动',
          type: 't4',
        }], // 列表数组
      inputText: '',
    };
    this.setItem = this.setItem.bind(this);
  }
  onDynamicType (item) {
    const { props } = this;
    const {
      returnpageName,
      deviceEventName,
    } = props.navigation.state.params;
    DeviceEventEmitter.emit(deviceEventName, { name: item.typeStr, id: item.type });
    props.navigation.navigate(returnpageName);
  }
  setItem (info) {
    console.log(info);
    return (
      <TouchableOpacity
        style={styles.itemPage}
        onPress={() => {
          this.onDynamicType(info.item);
        }}
      >
        <View style={[styles.itemTextPage, BaseStyle.borderBt]}>
          <Text style={[BaseStyle.text14, BaseStyle.lightGray]}>{info.item.typeStr}</Text>
        </View >
      </TouchableOpacity >
    );
  }
  render () {
    const { list } = this.state;
    return (
      <View style={styles.container}>
        <FlatList
          data={list}
          keyExtractor={(item, index) => index.toString()}
          renderItem={this.setItem}
        />
      </View >
    );
  }
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  tipsTextStyle: {
    textAlign: 'center',
    marginVertical: 24,
    color: '#7E7E7E',
    fontSize: 14,
    width: screen.width,
  },
  itemPage: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,

  },
  itemTextPage: {
    paddingVertical: 16,
    paddingHorizontal: 10,
  },
});
// export default ;
export default DynamicType;
