// 下拉通用组件
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, DeviceEventEmitter } from 'react-native';
import axios from 'axios';
// 参数说明：
// title: 传入的页面title,必需
// data:  传入的数据源，数组类型为字符串['张三','李四']或者
//        对象(如：[{id:'1',name:'张三'},{id:'2',name:'张三'}]),和url参数二选一
// url: 网络数据来源，和data参数二选一
// params: 参数对象 可选
// selected: 传入的默认值，对象则为id值
// type: type为页面取值监听方法名，必需，整个应用中唯一，不应该重复
// 参考数据：如下
// data: ['网客', '上门客', '400电话客户', '老客户']
// data: [{id:'1',name:'张三'},{id:'2',name:'李四'},{id:'3',name:'王五'}]
export default class SelectPicker extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.state.params.title,
    headerRight: <Text />,
  });
  // static defaultProps = {
  //   navigation: {},
  // }
  // static propTypes = {
  //   navigation: PropTypes.object,
  // }
  state = { data: [] };

  componentWillMount() {
    const { params } = this.props.navigation.state;
    if (params.data instanceof Array) {
      this.setState({ data: params.data });
    } else {
      this.getDataByUrl(params.url);
    }
  }

  async getDataByUrl(url) {
    const { params } = this.props.navigation.state;
    const data = await axios.get(url, { params: params.params || {} }).then((res) => {
      if (res.data.status === 'C0000') {
        return res.data.result;
      }
      return null;
    });
    this.setState({ data });
  }

  render() {
    const { goBack } = this.props.navigation;
    const { params } = this.props.navigation.state;
    return (
      <View style={styles.container}>
        <ScrollView style={styles.wrapper}>
          {this.state.data.map((item) => (<TouchableOpacity
            style={styles.btn}
            key={item.id ? item.id : item}
            onPress={() => {
              const { id = item, name = item } = item;
              const tmp = {
                id,
                name,
                type: params.type,
              };
              DeviceEventEmitter.emit(params.event, tmp);
              goBack();
            }}
          >
            {
              typeof (item) === 'string' ? (<Text style={[styles.name, params.selected === item ? styles.current : null]}>{item}</Text>) :
                (<Text style={[styles.name, params.selected === item.id ? styles.current : null]}>{item.name}</Text>)
            }
          </TouchableOpacity>))}
        </ScrollView >
      </View >
    );
  }
}
const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    backgroundColor: '#f5f5f9',
  },
  wrapper: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
  },
  btn: {
    height: 56,
    justifyContent: 'center',
    borderBottomColor: '#dedede',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  name: {
    fontSize: 16,
    color: '#3a3a3a',
  },
  current: {
    color: '#ffc601',
  },
});
