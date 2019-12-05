// 上数页面
import React, { PureComponent } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { withNavigation } from 'react-navigation';
import SafeAreaView from 'react-native-safe-area-view';
import axios from 'axios';
import { system } from '../../utils';
import screen from '../../utils/screen';
import BaseStyles from '../../style/BaseStyles';
import Icon from '../../components/Icon';
import ChildItem from './components/HouseNameItem';

class ShopAdminSearch extends PureComponent {
  static navigationOptions = {
    header: null,
  };
  constructor(props) {
    super(props);
    this.state = {
      list: [], // 列表数组
      tipsText: '', // 提示文字
      inputText: '',
    };
    this.onSearchText = this.onSearchText.bind(this);
    this.onGoBack = this.onGoBack.bind(this);
    this.requestData = this.requestData.bind(this);
    this.setItem = this.setItem.bind(this);
    this.clearInputText = this.clearInputText.bind(this);
  }
  componentDidMount () {
    this.requestData('');
  }
  // 用户输入时调用的事件
  onSearchText (text) {
    // 判断如果input已经清空 则list数组与提示文字都清空
    if (text === '') {
      this.clearInputText();
      // this.requestData('');
    } else {
      // 用户输入文字则调用请求函数
      this.setState({
        inputText: text,
      });
      this.requestData(text);
    }
  }
  onGoBack () {
    const { props } = this;
    props.navigation.goBack();
  }

  setItem (info) {
    const { props } = this;
    const {
      returnpageName,
      deviceEventName,
    } = props.navigation.state.params;
    return (<ChildItem
      item={info.item}
      returnpageName={returnpageName} // 点击之后返回的页面
      deviceEventName={deviceEventName} // 点击之后调用的emit
    />);
  }
  async requestData (text) {
    try {
      const res = await axios.get('gardenDynimic/queryGarden', {
        params:
        {
          keyword: text,
          pageSize: 100,
        },
      });
      if (res.data.status === 'C0000') {
        console.log(res.data);
        // 外部传入的回调函数，外部可获取到组件内请求到的数据进行后续操作
        this.setState({
          tipsText: '没有相关楼盘，请重新输入',
          list: res.data.result,
        });
      }
    } catch (err) {
      console.log(err);
    }
  }
  // 点击叉号清除输入框内容，清除list数据，清除tips文字
  clearInputText () {
    this.setState({
      inputText: '',
      tipsText: '',
      list: [],
    });
  }
  render () {
    const { list, tipsText, inputText } = this.state;
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={[BaseStyles.rowCenterSpace, styles.searchPage, !system.isIOS ? { marginTop: 20 } : null]}>
            <View style={[BaseStyles.rowStart, styles.searchInputBox]}>
              <Icon name="magnifier" color="#7a7a7a" size={12} style={{ marginRight: 8 }} />
              <TextInput
                style={{ flex: 1, fontSize: 14, paddingVertical: 0 }}
                placeholder="请输入楼盘名"
                onChangeText={(text) => {
                  this.onSearchText(text);
                }}
                value={inputText}
                underlineColorAndroid="transparent"
              />
              <TouchableOpacity style={{ alignSelf: 'flex-end' }} onPress={this.clearInputText}>
                <Icon name="chacha" color="#7a7a7a" size={16} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={this.onGoBack}>
              <Text style={{ fontSize: 14, color: '#3a3a3a' }}>取消</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }} >
            {
              list.length > 0 ?
                <FlatList
                  data={list}
                  extraData={this.state}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={this.setItem}
                /> : <Text style={styles.tipsTextStyle}>{tipsText}</Text>
            }
          </View>
        </View >
      </SafeAreaView>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9F9F9',
    flex: 1,
  },
  tipsTextStyle: {
    textAlign: 'center',
    marginVertical: 24,
    color: '#7E7E7E',
    fontSize: 14,
    width: screen.width,
  },
  searchPage: {
    width: screen.width,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomColor: '#EEEEEE',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchInputBox: {
    paddingLeft: 15,
    paddingRight: 10,
    paddingVertical: 5,
    backgroundColor: '#F9F9F9',
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(238,238,238,1)',
    flex: 1,
    marginRight: 20,
    flexDirection: 'row',
    height: 30,
  },
});
// export default ;
export default withNavigation(ShopAdminSearch);
