import React, { PureComponent } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import styles from './Search.style';


class SearchHistory extends PureComponent {
  query = '';

  constructor(props) {
    super(props);

    this.query = props.query;

    this.state = {
      list: [],
    };

    this.getHistory();
  }

  componentWillReceiveProps (nextProps) {
    this.query = nextProps.query;
  }

  getHistory () {
    storage.load({ key: this.props.historyKey }).then((res) => {
      this.setState({
        list: res,
      });
    }).catch((err) => { });
  }

  _clearHistory () {
    storage.remove({
      key: this.props.historyKey,
    });
    this.setState({
      list: [],
    });
  }

  render () {
    // 没有输入关键字且历史记录中有数据时进行渲染
    if (this.query.length == 0 && this.state.list.length > 0) {
      return (
        <View>
          <FlatList
            keyboardShouldPersistTaps="always"
            style={styles.listStyle}
            data={this.state.list}
            renderItem={this.props.renderItem}
            keyExtractor={(item, index) => index.toString()}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={this._clearHistory.bind(this)}
          >
            <Text style={[styles.itemText, { textAlign: 'center' }]}>
              清除搜索记录
            </Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  }
}

export default SearchHistory;
