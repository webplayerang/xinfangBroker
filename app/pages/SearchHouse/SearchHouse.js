// 搜索公司页面
import React, { PureComponent } from 'react';

import SearchResultPage from '../../components/SearchResultPage';
import HouseNameItem from './components/HouseNameItem';

class ShopAdminSearch extends PureComponent {
  static navigationOptions = {
    header: null,
  };
  constructor(props) {
    super(props);
    this.state = {};
    this.item = this.item.bind(this);
  }
  item(info) {
    const { props } = this;
    const {
      returnpageName,
      deviceEventName,
    } = props.navigation.state.params;
    return (
      <HouseNameItem
        item={info.item} // 数据
        returnpageName={returnpageName} // 点击之后返回的页面
        deviceEventName={deviceEventName} // 点击之后调用的emit
      />
    );
  }
  render() {
    return (
      <SearchResultPage
        ChildItem={this.item}
        path="/gardenDynimic/autoGardenSearch"
        transform={(res) => {
          const { result } = res.data;
          return result;
        }}
        placeholderText="请输入楼盘名称"
      />
    );
  }
}

export default ShopAdminSearch;
