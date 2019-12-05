import React, { PureComponent } from 'react';
// import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  DeviceEventEmitter,
  InteractionManager,
} from 'react-native';
import axios from 'axios';
import MyReleaseListItem from './MyReleaseListItem';
import BaseStyles from '../../style/BaseStyles';

export default class MyReleaseList extends PureComponent {
  // static propTypes = {
  //   navigation: PropTypes.objectOf,
  // }
  // static defaultProps = {
  //   navigation: null,
  // }
  constructor(props) {
    super(props);
    this.state = {
      myReleaseData: [],
      hadMore: false,
    };
    this.navigateTo = this.navigateTo.bind(this);
    this.myReleaseListItem = this.myReleaseListItem.bind(this);
  }
  componentDidMount () {
    this.listener = DeviceEventEmitter.addListener('RefreshReleaseList', () => {
      this.requestMyReleaseData();
    });
    this.requestMyReleaseData();
  }

  componentWillUnmount () {
    this.listener.remove();
  }

  requestMyReleaseData () {
    axios.get('expand/report/myReportPagination', { params: { pageSize: 2 } })
      .then((res) => {
        if (res.data.status === 'C0000') {
          const myReleaseData = res.data.result.items;

          this.setState({
            myReleaseData,
            hadMore: !!myReleaseData.length,
          });
        }
      });
  }

  myReleaseListItem (data) {
    return (
      <MyReleaseListItem
        item={data}
        navigation={this.props.navigation}
      />
    );
  }
  // 跳转路由 公共方法
  navigateTo (route, params = {}) {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  render () {
    return (

      <View style={BaseStyles.container}>
        <View style={styles.dailyGarden}>
          <View style={styles.commonHeader}>
            <View style={[styles.leftYellow, styles.myRelease]}>
              <Text style={styles.commonTitle}>我的历史发布</Text>
              {
                this.state.hadMore ?
                  <TouchableOpacity
                    style={styles.myReleaseMore}
                    onPress={() => this.navigateTo('MyReleaseManage')}
                  >
                    <Text style={[BaseStyles.yellow, BaseStyles.text14, {}]}>更多</Text>
                  </TouchableOpacity>
                  : null
              }
            </View>
          </View>
          <View>
            {
              this.state.myReleaseData.length ?
                <FlatList
                  data={this.state.myReleaseData}
                  renderItem={this.myReleaseListItem}
                  keyExtractor={(item, index) => index.toString()}
                />
                :
                <View style={[BaseStyles.centerContainer, { paddingBottom: 20 }]}>
                  <Text style={[BaseStyles.gray, BaseStyles.text16]}>暂无发布</Text>
                </View>
            }
          </View>
        </View>
      </View>


      // <View style={{ flex: 1 }}>
      //   {
      //     this.state.myReleaseData.length ?
      //       <FlatList
      //         data={this.state.myReleaseData}
      //         renderItem={this.myReleaseListItem}
      //         keyExtractor={(item,index)=>index.toString()}
      //       />
      //       :
      //       <View style={[BaseStyles.centerContainer, { paddingBottom: 20 }]}>
      //         <Text style={[BaseStyles.gray, BaseStyles.text16]}>暂无发布</Text>
      //       </View>
      //   }
      // </View>

    );
  }
}

const styles = StyleSheet.create({
  dailyGarden: {
    marginTop: 10,
    backgroundColor: '#fff',
  },
  commonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 66,
  },
  leftYellow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderLeftWidth: 3,
    borderLeftColor: '#ffc601',
  },
  commonTitle: {
    paddingLeft: 12,
    fontSize: 18,
    color: '#3a3a3a',
  },
  myRelease: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  myReleaseMore: {
    height: '100%',
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

