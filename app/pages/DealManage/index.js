
import React, { PureComponent } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
import axios from 'axios';
import DealGardenList from './DealGardenList';
import Icon from '../../components/Icon/';
import GoBack from '../../components/GoBack';
import BaseStyles from '../../style/BaseStyles';
import { UMNative } from '../../common/NativeHelper';
import { screen } from '../../utils';

export default class DealManage extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerTitle: '成交管理',
      headerRight: (
        <TouchableOpacity
          style={{ paddingRight: 15 }}
          onPress={() => {
            navigation.navigate('DealSearch');
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
  }

  constructor(props) {
    super(props);
    this.state = {
      listAdv: '',
      appUrl: '',
    };
    this.getListAdv = this.getListAdv.bind(this);
  }

  componentDidMount() {
    UMNative.onEvent('DEAL_MANAGE_COUNT');
    UMNative.onPageBegin('DEAL_MANAGER');
    this.getListAdv();
  }

  componentWillUnmount() {
    UMNative.onPageEnd('DEAL_MANAGER');
  }

  getListAdv() {
    axios.get('/ad/getAdByPostion', {
      params: {
        brokerAppPosition: 'TransactionListPage',
      },
    }).then((res) => {
      if (res.data.status === 'C0000' && res.data.result.picFdfsUrls.length > 0) {
        this.setState({
          listAdv: res.data.result.picFdfsUrls[0].replace('{size}', '750x150'),
          appUrl: res.data.result.appUrl,
        });
      }
    });
  }

  renderHeader() {
    if (this.state.listAdv) {
      return (<TouchableOpacity onPress={() => {
        if (!this.state.appUrl) {
          this.props.navigation.navigate('ViewPage', { url: this.state.appUrl });
        }
      }}
      ><Image style={styles.image} source={{ uri: this.state.listAdv }} /></TouchableOpacity>);
    }
    return null;
  }

  render() {
    const { navigation } = this.props;
    const { expandId } = navigation.state.params;
    const header = this.renderHeader();
    return (
      <View style={BaseStyles.container}>
        <ScrollableTabView
          style={BaseStyles.main}
          tabBarTextStyle={BaseStyles.tabBarText}
          tabBarActiveTextColor="#000"
          tabBarInactiveTextColor="#3a3a3a"
          tabBarUnderlineStyle={BaseStyles.lineStyle}
          renderTabBar={() => (<ScrollableTabBar style={BaseStyles.tabBar} />)}
        >
          <DealGardenList tabLabel="全部" header={header} navigation={navigation} />
          <DealGardenList tabLabel="待结算" header={null} expandId={expandId} status="NOT" navigation={navigation} />
          <DealGardenList tabLabel="部分结算" header={null} expandId={expandId} status="PART" navigation={navigation} />
          <DealGardenList tabLabel="已结算" header={null} expandId={expandId} status="ALL" navigation={navigation} />
        </ScrollableTabView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  image: {
    width: screen.width,
    height: 150,
    resizeMode: 'cover',
  },
});

