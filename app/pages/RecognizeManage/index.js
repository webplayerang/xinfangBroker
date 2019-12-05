
import React, { PureComponent } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
import axios from 'axios';
import RecognizeGardenList from './RecognizeGardenList';
import Icon from '../../components/Icon/';
import GoBack from '../../components/GoBack';
import BaseStyles from '../../style/BaseStyles';
import { UMNative } from '../../common/NativeHelper';
import { screen } from '../../utils';

export default class RecognizeManage extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerTitle: '认筹管理',
      headerRight: (
        <TouchableOpacity
          style={{ paddingRight: 15 }}
          onPress={() => {
            navigation.navigate('RecognizeSearch');
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
    this.state = {
      recognizeStatus: [],
      listAdv: '',
      appUrl: '',
    };
    this.getListAdv = this.getListAdv.bind(this);
  }

  componentDidMount() {
    UMNative.onEvent('RECOGNIZE_MANAGE_COUNT');
    UMNative.onPageBegin('RECOGNIZE_MANAGER');
    this.requestData();
    this.getListAdv();
  }

  componentWillUnmount() {
    UMNative.onPageEnd('RECOGNIZE_MANAGER');
  }

  getListAdv() {
    axios.get('/ad/getAdByPostion', {
      params: {
        brokerAppPosition: 'FromListPage',
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

  requestData() {
    axios.get('recognition/status')
      .then((res) => {
        this.setState({
          recognizeStatus: res.data.result,
        });
      });
  }

  renderHeader() {
    if (this.state.listAdv) {
      return (<TouchableOpacity onPress={() => {
        if (this.state.appUrl) {
          this.props.navigation.navigate('ViewPage', { url: this.state.appUrl });
        }
      }}
      ><Image style={styles.image} source={{ uri: this.state.listAdv }} /></TouchableOpacity>);
    }
    return null;
  }

  render() {
    const { navigation } = this.props;
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
          <RecognizeGardenList tabLabel="全部" header={header} navigation={navigation} />
          <RecognizeGardenList tabLabel="未收齐" header={null} status="NO" navigation={navigation} />
          <RecognizeGardenList tabLabel="已收齐" header={null} status="YES" navigation={navigation} />
          <RecognizeGardenList tabLabel="退款中" header={null} status="RUNNING" navigation={navigation} />
          <RecognizeGardenList tabLabel="部分退款" header={null} status="PARTAGREE" navigation={navigation} />
          <RecognizeGardenList tabLabel="已退款" header={null} status="AGREE" navigation={navigation} />
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

