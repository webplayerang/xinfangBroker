import React, { PureComponent } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  InteractionManager,
  DeviceEventEmitter,
} from 'react-native';
import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
import axios from 'axios';
import Icon from '../../components/Icon/';
import GoBack from '../../components/GoBack';
import { system, screen } from '../../utils';
import BaseStyles from '../../style/BaseStyles';
import RentReportSubList from './RentReportSubList';
import { UMNative } from '../../common/NativeHelper';

export default class ReportManage extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerTitle: '报备管理',
      headerRight: (
        <TouchableOpacity
          style={{ paddingRight: 15 }}
          onPress={() => {
            navigation.navigate('GardenSearch', { saleType: params.saleType });
          }}
        >
          <Icon name="magnifier" color="#848484" size={20} />
        </TouchableOpacity>
      ),
      headerLeft: (
        <GoBack
          navigation={navigation}
        />
      ),
    };
  };

  constructor(props) {
    super(props);
    this.changeTab = this.changeTab.bind(this);
  }

  componentDidMount() {
    const { props } = this;
    props.navigation.setParams({
      saleType: 'SELL',
    });
    UMNative.onEvent('REPORT_MANAGE_COUNT');
    UMNative.onPageBegin('REPORT_MANAGER');
  }

  componentWillUnmount() {
    UMNative.onPageEnd('REPORT_MANAGER');
  }

  changeTab(obj) {
    const { props } = this;
    if (obj.i === 1) {
      props.navigation.setParams({
        saleType: 'RENT',
      });
    } else {
      props.navigation.setParams({
        saleType: 'SELL',
      });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollableTabView
          style={BaseStyles.main}
          tabBarTextStyle={BaseStyles.tabBarText}
          onChangeTab={this.changeTab}
          tabBarActiveTextColor="#000"
          tabBarInactiveTextColor="#3a3a3a"
          tabBarUnderlineStyle={BaseStyles.lineStyle}
          renderTabBar={() => (<ScrollableTabBar style={BaseStyles.tabBar} />)}
        >
          <RentReportSubList
            style={styles.pageView}
            tabLabel="售盘报备"
            saleType="SELL"
            navigation={this.props.navigation}
          />
          <RentReportSubList
            style={styles.pageView}
            tabLabel="租赁报备"
            saleType="RENT"
            navigation={this.props.navigation}
          />
        </ScrollableTabView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: -10,
  },
  newEstateBox: {
    backgroundColor: '#fff',
    zIndex: 1,
    flex: 1,
    paddingBottom: system.isIOS ? 0 : 20,
  },
  noDataTipStyle: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 40,
  },
  center: {
    height: screen.height - 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageAllLoad: {
    backgroundColor: '#fff',
    width: screen.width,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  listImg: {
    width: '100%',
    height: '100%',
    // resizeMode: 'cover'
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: screen.width,
    height: 150,
    resizeMode: 'cover',
  },
  pageView: {
    backgroundColor: '#fff',
    zIndex: 1,
    flex: 1,
  },
});
