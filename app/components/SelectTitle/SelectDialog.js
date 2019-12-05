

import React, { PureComponent } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  DeviceEventEmitter,
} from 'react-native';
import { screen } from '../../utils';
// import BaseStyles from '../../style/BaseStyles';

export default class SelectDialog extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dialogSwitch: false,
      filerData: [],
    };
  }

  componentDidMount() {
    // 在static navigationOptions中使用this方法
    const { parent } = this.props;
    parent.props.navigation.setParams({
      filterViewShow: this.filterViewShow.bind(this),
    });
  }

  componentWillReceiveProps(data) {
    const filerData = data.data;
    this.setState({
      filerData,
    });
  }

  filterViewShow(val) {
    const { parent } = this.props;
    parent.filterDo(val); // 让使用该组件的父组件自己去处理页面刷新内容的事情
    this.setState({
      dialogSwitch: !this.state.dialogSwitch,
    });

    // setParams 连续设置2次 以第二次 生效
    if (val) {
      parent.props.navigation.setParams({
        defaultTitle: val.name,
        triangleDirection: !parent.props.navigation.state.params.triangleDirection,
      });
    } else {
      parent.props.navigation.setParams({
        triangleDirection: !parent.props.navigation.state.params.triangleDirection,
      });
    }
  }

  fliterviewEle() {
    const { parent } = this.props;
    if (this.state.dialogSwitch) {
      return (
        <View style={styles.container}>
          <ScrollView
            bounces={false}
            style={{ width: '100%' }}
          >
            {/* 遮罩层底部的按钮，点击关闭遮罩层 */}
            <TouchableOpacity
              style={styles.pressContainer}
              onPress={() => {
                this.filterViewShow();
              }}
            />
            {/* 遮罩层列表容器 */}
            <View style={styles.listContainer}>
              {
                this.state.filerData.map((val) => (
                  <TouchableOpacity
                    key={Math.random()}
                    style={styles.listItem}
                    onPress={() => {
                      this.filterViewShow(val);
                    }}
                  >
                    <Text style={{ fontSize: 16, color: '#3a3a3a' }}>{val.name}</Text>
                  </TouchableOpacity>
                ))
              }
            </View>
          </ScrollView>
        </View>
      );
    }
    return null;
  }


  render() {
    return (
      this.fliterviewEle()
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: screen.height - 60,
    zIndex: 900,
  },
  pressContainer: {
    position: 'absolute',
    top: 0,
    backgroundColor: '#000',
    opacity: 0.3,
    width: '100%',
    height: screen.height - 60,
    zIndex: 991,
  },
  listContainer: {
    width: '100%',
    backgroundColor: '#fff',
    zIndex: 999,
    paddingVertical: 10,
  },
  listItem: {
    height: 46,
    width: '100%',
    marginLeft: 15,
    justifyContent: 'center',
    borderColor: '#e7e8ea',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

