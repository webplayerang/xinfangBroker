// 下拉通用组件
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, DeviceEventEmitter } from 'react-native';
import axios from 'axios';


// 参数说明：
// title: 传入的页面title,必需

// url: 网络数据来源,必需
// params: 参数对象 可选
// selected: 传入的默认值，对象则为id值

// type: type为页面取值监听方法名，必需，整个应用中唯一，不应该重复


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


    this.getDataByUrl(params.url);
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
          {this.state.data.map((item) => (
            <TouchableOpacity
              style={styles.btn}
              key={Math.random()}
              onPress={() => {
                const tmp = {
                  ...item,
                  type: params.type,
                };
                DeviceEventEmitter.emit(params.type, tmp);
                goBack();
              }}
            >
              {
                <Text style={[styles.name, params.selected === item.positionId ? styles.current : null]}>
                  {item.positionName}（{item.orgName}）
                </Text>
              }
            </TouchableOpacity>
          ),
          )}
        </ScrollView>
      </View>
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
