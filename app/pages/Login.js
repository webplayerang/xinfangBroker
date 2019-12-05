import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import JPushModule from 'jpush-react-native';
import Toast, { DURATION } from 'react-native-easy-toast';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DeviceInfo from 'react-native-device-info';
import { screen, system } from '../utils';
import Icon from '../components/Icon/';
import HTTPAdapter from '../common/HTTPAdapter';
import { UMNative } from '../common/NativeHelper';

export default class Login extends React.Component {
  static navigationOptions = () => ({
    header: null,
    gesturesEnabled: false,
  }); // 是否可以右滑返回

  constructor(props) {
    super(props);
    this.state = { username: '', password: '', latitude: '', confirmFlag: false };
    this.login = this.login.bind(this);
    this.clearUsername = this.clearUsername.bind(this);
    this.clearPassword = this.clearPassword.bind(this);
  }
  componentDidMount() {
    HTTPAdapter.initInterceptors();
    this.getLocalUserInfo();
  }

  async getLocalUserInfo() {
    const data = await global.storage
      .load({ key: 'userInfo' })
      .then((res) => res)
      .catch(() => ({}));

    this.setState({
      username: data.username,
      password: data.password,
    });
  }

  login() {
    // 避免多次点击登录按钮
    if (this.state.confirmFlag) {
      return;
    }

    if (!this.state.username) {
      this.toast.show('请输入用户名', DURATION.LENGTH_SHORT);
      return;
    }
    if (!this.state.password) {
      this.toast.show('请输入密码', DURATION.LENGTH_SHORT);
      return;
    }

    this.setState({ confirmFlag: true });

    UMNative.onEvent('LOGIN_USER_COUNT');

    axios
      .get('/user/login', {
        params: {
          username: this.state.username,
          password: this.state.password,
        },
      })
      .then((res) => {
        this.setState({ confirmFlag: false });
        if (res.data.status === 'C0000') {
          const managerSid = res.data.result;
          global.storage.save({
            key: 'managerSid',
            data: managerSid,
            expires: null,
          });
          global.storage.save({
            key: 'userInfo',
            data: {
              username: this.state.username,
              password: this.state.password,
            },
            expires: null,
          });

          HTTPAdapter.setup({ managerSid });
          // 发送极光id到后台绑定
          JPushModule.getRegistrationID((registrationId) => {
            // 对模拟器中不存在 registrationId，就直接跳转首页
            if (registrationId) {
              this.bindYunInfo(registrationId);
            } else {
              this.props.navigation.navigate('TabHome');
            }
          });
        } else {
          this.toast.show(res.data.message);
        }
      })
      .catch(() => {
        this.setState({ confirmFlag: false });
      });
  }

  // 发送极光id到后台绑定
  bindYunInfo(registrationId) {
    const brandName = DeviceInfo.getBrand(); // 商标 Apple
    const mobileType = DeviceInfo.getDeviceId(); // iPhone8,1
    const appType = DeviceInfo.getSystemName(); // 系统名称IOS
    const version = DeviceInfo.getSystemVersion(); // 系统版本11.0.1
    const appVersion = DeviceInfo.getVersion(); // 应用版本3.1.0

    navigator.geolocation.getCurrentPosition(
      (location) => {
        // 可以获取到的数据
        const latitude = `${location.coords.longitude.toFixed(2)},${location.coords.latitude.toFixed(2)}`;
        this.setState({ latitude });
      });

    axios
      .get('/app/bindYunInfo', {
        params: {
          brandName,
          latitude: this.state.latitude,
          mobileType,
          version,
          appVersion,
          appType,
          registrationId,
        },
      })
      .then((res) => {
        if (res.data.status === 'C0000') {
          this.setState({ confirmFlag: false });
          this.props.navigation.navigate('TabHome');
        } else {
          this.toast.show('登录失败！');
        }
      });
  }

  clearUsername() {
    this.setState({ username: '' });
  }

  clearPassword() {
    this.setState({ password: '' });
  }

  render() {
    return (
      <KeyboardAwareScrollView style={styles.container}>
        <ScrollView>
          <Image
            style={styles.img}
            source={require('../assets/img/login.png')}
          />
          <View style={styles.login}>
            <View style={styles.inputWrapper}>
              <Icon
                name="gerenziliao"
                size={16}
                color="#d3d3d3"
                style={styles.iconUsername}
              />
              <TextInput
                style={styles.inputText}
                onChangeText={(text) => this.setState({ username: text.trim() })}
                value={this.state.username}
                minLength={11}
                keyboardType="numeric"
                maxLength={11}
                placeholder="请输入用户名"
                placeholderTextColor="#a8a8a8"
                underlineColorAndroid="transparent"
                clearButtonMode="while-editing"
              />
              {!system.isIOS ? (
                <TouchableOpacity onPress={this.clearUsername}>
                  <Icon
                    name="baocuo2"
                    size={14}
                    color="#e2e2e2"
                    style={{
                      padding: 10,
                      paddingRight: 17,
                    }}
                  />
                </TouchableOpacity>
              ) : null}
            </View>
            <View style={styles.inputWrapper}>
              <Icon
                name="mima"
                size={16}
                color="#d3d3d3"
                style={styles.iconUsername}
              />
              <TextInput
                style={styles.inputText}
                onChangeText={(text) => this.setState({ password: text.trim() })}
                value={this.state.password}
                secureTextEntry
                placeholder="请输入密码"
                placeholderTextColor="#a8a8a8"
                underlineColorAndroid="transparent"
                clearButtonMode="while-editing"
              />
              {!system.isIOS ? (
                <TouchableOpacity onPress={this.clearPassword}>
                  <Icon
                    name="baocuo2"
                    size={14}
                    color="#e2e2e2"
                    style={{
                      padding: 10,
                      paddingRight: 17,
                    }}
                  />
                </TouchableOpacity>
              ) : null}
            </View>
            <TouchableOpacity onPress={this.login} style={styles.btn}>
              <Text style={styles.btnText}>
                {this.state.confirmFlag ? '登录中' : '登录'}
              </Text>
            </TouchableOpacity>
          </View>
          <Toast
            ref={(toast) => {
              this.toast = toast;
            }}
            position="center"
            opacity={0.7}
          />
        </ScrollView>
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  img: {
    width: screen.width,
    height: 270,
  },
  login: {
    paddingHorizontal: 20,
    marginTop: 45,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#e7e8ea',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 20,
  },
  inputText: {
    flex: 1,
    paddingLeft: 10,
    fontSize: 14,
    color: '#3a3a3a',
    height: 40,
  },
  btn: {
    marginTop: 20,
    backgroundColor: '#ffc601',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 6,
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
  },
  clearIcon: {
    padding: 10,
    paddingRight: 17,
  },
});
