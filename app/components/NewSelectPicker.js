// 选中返回的 单选组件；
import React, { PureComponent } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  DeviceEventEmitter,
} from 'react-native';

import axios from 'axios';
/*  参数说明： 参数均从 导航传入

* title: (str)传入的页面title,必需
* data: (object)传入的数据,必需,  支持url请求或者直接传数据，组件列表的数据类型为array
        {
          type:'url' or 'arr',
          dataObj:{}, 1,url 时，  {
                                    url:'',
                                    params:{},
                                    itemKey:{key:'idName',value:'valueName'}  仅dataArr的item类型为对象时，需传该值
                                  } 固定格式 暂时为 get类型请求；接口返回值为res.data.result类型
                      2，arr 时， {
                                  dataArr:[], item类型为 sting 或 obj,
                                  itemKey:{key:'idName',value:'valueName'}  仅dataArr的item类型为对象时，需传该值
                                 }
        }
* selected:(str) 传入的默认值，item或者idName
* eventName: (str) eventName为页面取值监听方法名，必需，整个应用中唯一，不应该重复
*/
export default class NewSelectPicker extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.state.params.title,
    headerRight: <Text />,
  });

  state = { data: [] };

  componentWillMount() {
    const { params = {} } = this.props.navigation.state;
    const { data = {} } = params;
    this.navigationParams = params;
    if (data.type === 'url') { // 请求 类型
      this.getDataByUrl(data.dataObj);
    } else { // 直接传数据 类型
      this.setState({ data: data.dataObj.dataArr });
    }
  }

  async getDataByUrl(dataObj) {
    const data = await axios.get(dataObj.url, { params: dataObj.params || {} })
      .then((res) => {
        if (res.data.status === 'C0000') {
          return res.data.result || [];
        }
        return [];
      });
    this.setState({ data });
  }

  render() {
    const { navigation } = this.props;
    const { goBack } = navigation;
    const { params } = navigation.state;
    return (
      <View style={styles.container}>
        <ScrollView style={styles.wrapper}>
          {
            this.state.data.map((item) => (<TouchableOpacity
              style={styles.btn}
              key={Math.random()}
              onPress={() => {
                DeviceEventEmitter.emit(this.navigationParams.eventName, item);
                goBack();
              }}
            >
              {
                typeof (item) === 'string' ?
                  (<Text style={[styles.name, this.navigationParams.selected === item ? styles.current : null]}>{item}</Text>)
                  :
                  (
                    <Text style={[styles.name, this.navigationParams.selected === item[this.navigationParams.dataObj.itemKey.key] ? styles.current : null]}>
                      {item[this.navigationParams.dataObj.itemKey.value]}
                    </Text>
                  )
              }
            </TouchableOpacity>))
          }
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
