import React, { PureComponent, Component } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableHighlight,
  StyleSheet,
  DeviceEventEmitter,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import Toast, { DURATION } from 'react-native-easy-toast';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from '../components/Icon/';
import GoBack from '../components/GoBack';
import { screen, system } from '../utils';
import MyDatePicker from '../components/MyDatePicker';

/**
 * props:
 *  expendId:扩展楼盘ID，必填
 *  gardenName:楼盘名，必填
 *  customerName:客户名，选填
 *  customerPhone:客户手机号，选填
 *
 */
export default class AddReport extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: '楼盘报备',
    headerLeft: <GoBack navigation={navigation} />,
  });

  componentWillMount() {
    const { params } = this.props.navigation.state;
    this.state = {
      employeeId: '',
      brokerName: '',
      expandId: params.expandId,
      customerPhone: params.customerPhone,
      customerName: params.customerName,
      gardenName: params.gardenName,
    };
  }

  componentDidMount() {
    this.subAddress = DeviceEventEmitter.addListener('contactChoose', (data) => {
      this.setState({
        customerName: data.customerName,
        customerPhone: data.customerPhone,
      });
    });

    // 获取客户选择
    this.brokerListener = DeviceEventEmitter.addListener(
      'BrokerPicker',
      (item) => {
        if (item.type === 'BrokerPicker') {
          this.setState({
            employeeId: item.employeeId,
            brokerName: item.brokerName,
          });
        }
      },
    );
  }

  componentWillUnmount() {
    this.subAddress.remove();
    this.brokerListener.remove();
  }

  address() {
    this.props.navigation.navigate('ContactsList');
  }

  submit() {
    const { params } = this.props.navigation.state;
    if (!this.state.customerName) {
      this.refs.toast.show('请输入客户姓名');
      return;
    }
    const reg = /^\d{11,13}$/;
    if (!reg.test(this.state.customerPhone)) {
      this.refs.toast.show('请输入11位或13位手机号码');
      return;
    }

    if (!this.state.employeeId) {
      this.refs.toast.show('请选择经纪人');
      return;
    }

    this.setState({ submit: true });
    axios
      .get('reservation/add', {
        params: {
          employeeId: this.state.employeeId, // 经纪人ID
          expandId: this.state.expandId, // 扩展ID
          customerPhone: this.state.customerPhone,
          customerName: this.state.customerName,
          saleType: params.saleType,
        },
        timeout: 3000,
      })
      .then((res) => {
        this.setState({ submit: false });
        if (res.data.status === 'C0000') {
          this.refs.toast.show('报备成功');
          this.props.navigation.goBack();
          DeviceEventEmitter.emit('LatestReport');
          DeviceEventEmitter.emit('PersonalReportList');
          DeviceEventEmitter.emit('DailyGardenList');
        } else {
          this.refs.toast.show(`报备失败,${res.data.message}`);
        }
      })
      .catch((e) => {
        this.refs.toast.show('报备失败');
      });
  }

  render() {
    const { navigate } = this.props.navigation;
    const { editFlag } = !this.state.customerName;
    return (
      <KeyboardAwareScrollView style={styles.container}>
        <ScrollView>
          <View style={styles.inputContainer}>
            <View style={styles.inputView}>
              <Text style={styles.inputViewText}>楼盘：</Text>
              <Text
                style={[
                  styles.inputViewText,
                  { width: screen.width - 130, marginLeft: 0, color: '#000000' },
                ]}
                numberOfLines={1}
              >
                {this.state.gardenName}
              </Text>
            </View>
            <View style={styles.inputView}>
              <Text style={styles.inputViewText}>客户：</Text>
              <TextInput
                onChangeText={(text) => this.setState({ customerName: text })}
                editable={editFlag}
                style={[styles.inputViewInput]}
                placeholder="请输入客户姓名"
                value={this.state.customerName}
                maxLength={10}
                underlineColorAndroid="transparent"
              />
              {editFlag ? (
                <View />
              ) : (
                <TouchableHighlight
                  style={styles.inputViewImage}
                  underlayColor="#f0f0f0"
                  onPress={() => this.address()}
                >
                  <View>
                    <Icon name="arrow-right" size={16} />
                  </View>
                </TouchableHighlight>
              )}
            </View>
            <View style={styles.inputView}>
              <Text style={styles.inputViewText}>手机：</Text>
              <TextInput
                onChangeText={(text) => this.setState({ customerPhone: text })}
                editable={editFlag}
                style={[styles.inputViewInput]}
                placeholder="请输入客户手机号"
                keyboardType="numeric"
                value={this.state.customerPhone}
                maxLength={20}
                underlineColorAndroid="transparent"
              />
            </View>
            <TouchableHighlight
              style={[styles.inputView]}
              underlayColor="#f0f0f0"
              onPress={() => {
                navigate('BrokerPicker', {
                  title: '人员选择',
                  url: '/reservation/selectBroker',
                  event: 'BrokerPicker',
                  type: 'BrokerPicker',
                  params: { pageSize: 30 },
                });
              }}
            >
              <View
                style={[
                  { flexDirection: 'row', height: '100%' },
                  styles.selectReporter,
                ]}
              >
                <Text style={styles.inputViewText}>经纪人：</Text>
                <View style={styles.selectReporter}>
                  <TextInput
                    editable={false}
                    style={[styles.inputViewInput]}
                    placeholder="请选择经纪人"
                    value={this.state.brokerName}
                    maxLength={10}
                    underlineColorAndroid="transparent"
                  />
                  <View style={styles.inputViewImage}>
                    <Icon name="arrow-right" size={16} color="#3a3a3a" />
                  </View>
                </View>
              </View>
            </TouchableHighlight>

            {/* <View style={styles.inputView}>
            <Text style={[styles.inputViewText, { width: 120 }]}> 预计到访时间：</Text>
            <MyDatePicker mode="datetime" format="YYYY-MM-DD H:m" minDate maxDate />
          </View> */}
          </View>
          <View style={styles.inputTip}>
            <Text style={styles.inputTipText}>
              手机号码必须为11或13位数字，格式如下：
            </Text>
            <Text style={[styles.inputTipText, { marginTop: 3 }]}>
              内地： 13688888888 港澳： 00852888888
            </Text>
          </View>
          <TouchableHighlight
            style={[
              styles.button,
              this.state.submit && { backgroundColor: '#7e7e7e' },
            ]}
            onPress={() => this.submit()}
            underlayColor="#E1F6FF"
          >
            <Text style={styles.buttonText}>提交</Text>
          </TouchableHighlight>
          <Toast ref="toast" positionValue={screen.height / 2} opacity={0.7} />
        </ScrollView>
      </KeyboardAwareScrollView>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    backgroundColor: '#f5f5f9',
    height: '100%',
  },
  inputContainer: {
    backgroundColor: '#fff',
  },
  inputView: {
    flexDirection: 'row',
    height: 55,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginLeft: 15,
    borderBottomColor: '#e7e8ea',
  },
  inputViewText: {
    width: 80,
    fontSize: 16,
    color: '#7e7e7e',
  },
  inputViewInput: {
    fontSize: 16,
    width: screen.width - 170,
    marginTop: 2,
  },
  inputViewImage: {
    marginLeft: 30,
    alignItems: 'flex-end',
  },
  inputTip: {
    marginTop: 10,
    marginLeft: 15,
    marginBottom: 50,
  },

  inputTipText: {
    fontSize: 14,
    color: '#a8a8a8',
  },
  button: {
    backgroundColor: '#f39800',
    width: screen.width * 0.92,
    height: screen.height * 0.065,
    marginLeft: screen.width * 0.04,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
  },
  reportList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 54,
    paddingLeft: 15,
    borderBottomColor: '#e7e8ea',
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: '#fff',
  },
  selectReporter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
