import React, { PureComponent } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  DeviceEventEmitter,
  TouchableOpacity,
  InteractionManager,
} from 'react-native';
import StatusView from '../../components/StatusView';
import { screen, system } from '../../utils/';
import BaseStyle from '../../style/BaseStyles';

let height = 65;
let paddingTop = 20;
if (system.isIphoneX) {
  height = 75;
  paddingTop = 30;
} else if (system.isIphoneXs) {
  height = 85;
  paddingTop = 40;
}
export default class Message extends PureComponent {
  static navigationOptions = {
    header: null,
  }

  constructor(props) {
    super(props);
    this.state = {
      data: [],
      isLoading: true,
    };
    this.requestData = this.requestData.bind(this);
  }

  componentDidMount() {
    this.requestData();
    DeviceEventEmitter.addListener('MessageRefresh', () => {
      this.requestData();
    });
  }

  requestData() {
    // load
    global.storage.load({
      key: 'MessageData',
    }).then((ret) => {
      this.setState({
        isLoading: false,
        data: ret.items,
      });
    }).catch((err) => {
      switch (err.name) {
        case 'NotFoundError':
          this.setState({
            isLoading: false,
          });
          break;
        case 'ExpiredError':
          this.setState({
            isLoading: false,
          });
          break;
        default:
          break;
      }
    });
  }
  keyExtractor = () => Math.random();
  renderItem(item) {
    return (
      <TouchableOpacity
        onPress={() => {
          InteractionManager.runAfterInteractions(() => {
            this.props.navigation.navigate('ReportDetail', { reservationId: item.reservationId });
          });
        }}
      >
        <View style={styles.row}>
          <Text style={styles.rowTitle}>{item.content}</Text>
          <Text style={styles.rowText}>{item.msg}</Text>
        </View>
      </TouchableOpacity>

    );
  }
  render() {
    // if (this.state.isLoading) {
    //   return (<StatusView />);
    // }

    // if (!this.state.data.length) {
    //   return (<View style={styles.noData}><Text>暂无数据！</Text></View>);
    // }
    return (
      <View style={BaseStyle.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>消息中心</Text>
        </View>
        {this.state.isLoading && <StatusView />}
        {!this.state.data.length && <View style={styles.noData}><Text>暂无数据！</Text></View>}
        <FlatList
          data={this.state.data}
          style={styles.container}
          keyExtractor={this.keyExtractor}
          renderItem={({ item }) => this.renderItem(item)
          }
        />
      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
  },
  noData: {
    height: screen.height - 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    paddingVertical: 20,
    paddingLeft: 20,
    backgroundColor: '#fff',
    borderBottomColor: '#E9E9EB',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
  },
  rowTitle: {
    fontSize: 16,
    color: '#7E7E7E',
    marginRight: 10,
  },
  rowText: {
    fontSize: 14,
    color: '#3a3a3a',
  },
  header: {
    height,
    paddingTop,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 'normal',
    color: '#3a3a3a',
    fontSize: 18,
  },
});
