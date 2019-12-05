/**
 * qfang.com xinfang
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { PureComponent } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import axiosErp from '../../common/AxiosInstance';
import Icon from '../../components/Icon/';
import Autocomplete from '../../components/AutoComplete';
import styles from '../SearchView/Search.style';

const CancelToken = axios.CancelToken;
class Search extends PureComponent {
  static navigationOptions = {
    header: null,
  };

  static defaultProps = {
    list: [],
    itemKey: 'id',
    itemValue: 'value',
    placeholderText: '请输入关键字',
    historyKey: 'historyList',
    defaultSearch: false, // 当input 传入的keyword为空时的 搜索
    renderItem: () => null,
    onSelect: () => null,
    transform: (data) => data,
  };

  constructor(props) {
    super(props);

    this.state = {
      list: [],
      query: props.query || '',
      isActivityIndicator: false,
      errSource: false,
      defaultErrSource: false,
    };

    // this.historyKey = `${this.props.historyKey}-${BaseInfo.accountId}`;
    this.cancel = null;
  }
  componentDidMount() {
    this.defaultSearch = true;
    if (this.props.defaultSearch) {
      this.requestData();
    }
  }
  // 关键字输入后向后台模糊查询
  requestData(query) {
    if (this.cancel) {
      this.cancel('取消快速输入时之前未完成的请求');
    }
    // defaultSearch搜索时 query 为undefined
    if (query === undefined) {
      this.defaultSearch = false;
    }

    if (this.defaultSearch && query.length === 0) {
      this.setState({
        list: [],
      });
      return;
    }

    const params = Object.assign({ numberOrGardenName: query }, this.props.params);

    axiosErp.instance.get(this.props.url, {
      params,
      cancelToken: new CancelToken((c) => {
        this.cancel = c;
      }),
    }).then((res) => {
      if (res.status === 200) {
        const data = this.props.transform(res.data);
        if (data.length === 0) {
          if (query === 'undefined') {
            this.setState({
              list: [],
              defaultErrSource: true,
              isActivityIndicator: false,
            });
          } else {
            this.setState({
              list: [],
              errSource: true,
              isActivityIndicator: false,
            });
          }
        } else {
          this.setState({
            list: data,
            errSource: false,
            defaultErrSource: false,
            isActivityIndicator: false,
          });
        }
      } else {
        this.setState({
          list: [],
          errSource: true,
          defaultErrSource: false,
          isActivityIndicator: false,
        });
      }
    }).catch(() => {
    });
  }

  /* 选中项后的操作
   * 保存到历史记录中
   * 调用外部"选中"方法进行相应处理
   */
  _selectItem(item) {
    // this._saveHistory(item);

    // 回显选中的文字到输入框中
    // this.setState({ query: item[this.props.itemValue] });

    this.props.onSelect(item);
  }


  // 查询结果的展示
  _renderItem = ({ item }) =>
    this.props.renderItem(item)

    // (
    //   <TouchableOpacity style={styles.itemRow} onPress={() => { this._selectItem(item) }}>
    //     {this.props.renderItem(item)}
    //   </TouchableOpacity>
    // );
    ;

  _renderTextInput(props) {
    const defaultSearch = this.props.defaultSearch;
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={
            [styles.inputStyle, styles.searchView, defaultSearch && { width: '95%' }]
          }
        >
          <Icon
            name="magnifier"
            size={18}
            color="#7e7e7e"
            style={{
              marginLeft: 10,
              marginRight: 10,
            }}
          />
          <TextInput
            {...props}
            style={[styles.inputStyle, { fontSize: 14 }]}
            placeholderTextColor="#7e7e7e"
            underlineColorAndroid="transparent"
          />
        </View>
        {!defaultSearch &&
          <TouchableOpacity
            style={styles.button}
            onPress={() => { props.navigation.goBack(); }}
          >
            <Text style={styles.buttonText}>
              取消
            </Text>
          </TouchableOpacity>
        }
      </View>
    );
  }

  render() {
    const defaultSearch = this.props.defaultSearch;
    return (
      <View style={styles.container}>
        <Autocomplete
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          data={this.state.list}
          isActivityIndicator={this.state.isActivityIndicator}
          errSource={this.state.errSource}
          defaultErrSource={this.state.defaultErrSource}
          containerStyle={[styles.autocompleteContainer, defaultSearch && { top: 0 }]}
          inputContainerStyle={styles.inputContainerStyle}
          listContainerStyle={[styles.listContainerStyle, defaultSearch && { marginTop: 10 }]}
          listStyle={[styles.listStyle, this.props.listStyle]}
          renderTextInput={this._renderTextInput.bind(this)}
          onChangeText={(text) => {
            if (text.length === 0) {
              this.setState({
                query: text.trim(),
                list: [],
                isActivityIndicator: false,
                errSource: false,
              });
            } else {
              this.setState({
                query: text.trim(),
                list: [],
                isActivityIndicator: true,
                errSource: false,
              });
            }
            this.requestData(text.trim());
          }}
          placeholder={this.props.placeholderText}
          renderItem={this._renderItem.bind(this)}
          navigation={this.props.navigation}
        />

      </View>
    );
  }
}

export default Search;
