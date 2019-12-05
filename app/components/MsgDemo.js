import React from 'react';
import { Text, View } from 'react-native';
import JPushModule from 'jpush-react-native';
import GoBack from './GoBack';
import system from '../utils/system';

export default class MsgDemo extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: '推送',
    headerLeft: (<GoBack navigation={navigation} />),
  });
  constructor(props) {
    super(props);
    this.state = {
      msg: '推送消息测试',
    };
  }

  componentDidMount() {
    // 务必在接收事件之前调用此方法
    if (!system.isIOS) {
      JPushModule.notifyJSDidLoad(() => {
      });
    }

    JPushModule.addReceiveNotificationListener((message) => {
      if (system.isIOS) {
        this.setState({ msg: message.aps.alert });
      } else {
        this.setState({ msg: message.alertContent });
      }
    });
  }

  componentWillUnmount() {
    JPushModule.removeReceiveNotificationListener();
  }


  render() {
    return (
      <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
        <Text>{this.state.msg}</Text>
      </View>
    );
  }
}
