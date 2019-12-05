import React, { PureComponent } from 'react';
import {
  StyleSheet,
  View,
  Text,
  InteractionManager,
} from 'react-native';
import axios from 'axios';
import BaseStyles from '../../style/BaseStyles';

export default class ProjectMemberList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.requestData();
    });
  }

  requestData() {
    const { expandId } = this.props;
    return axios.get('companyStatistics/getGardenUsers', { params: { expandId } })
      .then((res) => {
        if (res.data.status === 'C0000') {
          const data = res.data.result;
          this.setState({
            data,
          });
          return;
        }
        this.setState({
          data: [],
        });
      })
      .catch((err) => {
        this.setState({
          data: [],
        });
      });
  }
  renderItem(val) {
    // val.desc 是字符串描述，需要切开 分别展示
    const detail = val.desc.split(/（|）|\(|\)/g);
    if (detail.length === 3) {
      return (
        <View style={[styles.itemContainer, BaseStyles.borderTop]}>
          <Text style={[BaseStyles.black, BaseStyles.text16]}>{detail[0]}</Text>
          <Text style={[BaseStyles.gray, BaseStyles.text14, { paddingLeft: 10, paddingTop: 2 }]}>({detail[1]})</Text>
          <Text style={[BaseStyles.gray, BaseStyles.text14, { paddingTop: 2 }]}>{detail[2]}</Text>
        </View>
      );
    }
    return (
      <View style={[styles.itemContainer, BaseStyles.borderTop]}>
        <Text style={[BaseStyles.black, BaseStyles.text16]}>{val.desc}</Text>
      </View>
    );
  }

  render() {
    const data = this.state.data;
    return (
      <View style={{ backgroundColor: '#fff', marginTop: 10 }}>
        <View style={BaseStyles.comTitleOutBox}>
          <View style={BaseStyles.comTitleBox}>
            <Text style={[BaseStyles.comTitle, BaseStyles.black]}>项目人员  ({data.length}人)</Text>
          </View>
        </View>
        {
          data.map((val) => (
            <View key={Math.random()}>
              {this.renderItem(val)}
            </View>
          ))
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    height: 56,
    alignItems: 'center',
    marginLeft: 15,
  },
});
