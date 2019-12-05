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
import { system } from '../utils';
import PropTypes from 'prop-types';
import axios from 'axios';
import screen from '../utils/screen';
import BaseStyles from '../style/BaseStyles';
import Icon from '../components/Icon';

class ShopAdminSearch extends PureComponent {
  static propTypes = {
    ChildItem: PropTypes.func.isRequired, // 传入的item
    path: PropTypes.string.isRequired, // 请求路径
    transform: PropTypes.func.isRequired, // 数据路径
    placeholderText: PropTypes.string, // 传入的输入框placeHolder
    getInfo: PropTypes.func, // 回调函数,外部可接收请求回来的数据
  }
  static defaultProps = {
    placeholderText: '请输入内容',
    getInfo: () => { },
  }
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

  }
  // 用户输入时调用的事件
  onSearchText (text) {
    // 判断如果input已经清空 则list数组与提示文字都清空
    if (text === '') {
      this.clearInputText();
      return;
    }
    // 用户输入文字则调用请求函数
    this.setState({
      inputText: text,
    });
    this.requestData(text);
  }
  onGoBack () {
    const { props } = this;
    props.navigation.goBack();
  }

  setItem (info) {
    const { ChildItem } = this.props;
    return <ChildItem item={info.item} />;
  }
  async requestData (text) {
    const { path, getInfo, transform } = this.props;
    try {
      const res = await axios.get(path, {
        params:
        {
          keyword: text,
          // keyword: '楼',
          pageSize: 20,
        },
      });
      if (res.data.status === 'C0000') {
        // 外部传入的回调函数，外部可获取到组件内请求到的数据进行后续操作
        getInfo(res.data.result);
        const items = transform(res);
        this.setState({
          tipsText: '找不到相关信息，请换个内容试试',
          list: items,
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
    const { placeholderText } = this.props;
    const { list, tipsText, inputText } = this.state;
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={[BaseStyles.rowCenterSpace, styles.searchPage, !system.isIOS ? { marginTop: 20 } : null]}>
            <View style={[BaseStyles.rowStart, styles.searchInputBox]}>
              <Icon name="magnifier" color="#7a7a7a" size={12} style={{ marginRight: 8 }} />
              <TextInput
                style={{ flex: 1, fontSize: 14, paddingVertical: 0 }}
                placeholder={placeholderText}
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
    height: 35,
  },
});
// export default ;
export default withNavigation(ShopAdminSearch);
