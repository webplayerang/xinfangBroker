import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  InteractionManager,
  DeviceEventEmitter,
} from 'react-native';
import Toast from 'react-native-easy-toast';
import axios from 'axios';
import DialogBox from '../../components/react-native-dialogbox';
import Icon from '../../components/Icon';
import BaseStyles from '../../style/BaseStyles';
import { screen, system } from '../../utils';

let height = 200;
let paddingTop = 0;
if (system.isIphoneX) {
  height = 210;
  paddingTop = 10;
} else if (system.isIphoneXs) {
  height = 220;
  paddingTop = 20;
}

export default class Me extends PureComponent {
  static navigationOptions = {
    header: null,
  }
  constructor(props) {
    super(props);
    this.state = {
      userName: '',
      orgName: '',
      positionId: 0,
    };
    this.changePosition = this.changePosition.bind(this);
  }

  componentDidMount () {
    this.requestData();
    this.changePositionListener = DeviceEventEmitter.addListener('Position', (item) => {
      this.setState({
        positionId: item.positionId,
      });
      this.changePosition(item.positionId);
      DeviceEventEmitter.emit('ResetErpDefaultParams', item);
    });
  }

  componentWillUnmount () {
    this.changePositionListener.remove();
  }

  changePosition (positionId) {
    axios.get('/user/changPosition', {
      params: { positionId },
    })
      .then((res) => {
        if (res.data.status === 'C0000') {
          // global.storage.save({ //暂时不用该功能
          //   key: 'positionId',
          //   data: positionId,
          //   expires: null,
          // });
          this.setState({
            orgName: res.data.result,
          });

          // 切换岗位时更新首页的最新报备
          DeviceEventEmitter.emit('LatestReport');
        } else {
          console.log(res, '岗位切换失败！');
        }
      })
      .catch((err) => {
        console.log(err, '岗位切换失败！');
      });
  }

  requestData () {
    axios.get('user/detail')
      .then((res) => {
        if (res.data.status === 'C0000') {
          const { result } = res.data;
          this.setState({
            userName: result.name,
            orgName: result.orgName,
            positionId: result.positionId,
          });
        }
      });
  }

  versionUpdate () {
    this.toast.show('已经是最新版本');
  }

  navigateTo (route, params = {}) {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  // 确认弹出框
  logoutConfirm () {
    // 添加跟进弹窗
    this.dialogbox.confirm({
      title: null,
      content: (
        <View style={styles.modelBox}>
          <View style={styles.modelTilteBox}>
            <Icon name="jingshi" size={20} color="#ffc601" style={{ width: 34 }} />
            <Text style={styles.modelTilte}>确认退出吗？</Text>
          </View>
        </View>),
      cancel: {
        text: '取消',
        style: {
          color: '#3a3a3a',
          fontSize: 18,
        },
      },
      ok: {
        text: '确认',
        style: {
          fontSize: 18,
          color: '#ffa200',
        },
        callback: () => {
          DeviceEventEmitter.emit('Logout');
        },
      },
    });
  }

  render () {
    const { userName, orgName } = this.state;
    return (
      <View style={BaseStyles.container}>
        <View style={styles.header}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={() => {
                this.navigateTo(
                  'SelectPickerPosition', {
                  title: '岗位切换',
                  url: '/user/getERPPosition',
                  selected: this.state.positionId,
                  type: 'Position',
                });
              }}
              style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center', right: 30, top: 30, position: 'absolute', width: 100, height: 30 }}
            >
              <Text style={{ fontSize: 16 }}>岗位切换</Text>
              <Icon name="arrow-right" color="#000" size={14} />
            </TouchableOpacity>
            <Image
              style={styles.img}
              source={require('../../assets/img/head.png')}
            />
            <Text style={[BaseStyles.block, BaseStyles.text16, { marginBottom: 10 }]}>
              {userName}
            </Text>
            <Text style={[BaseStyles.gray, BaseStyles.text16]}>
              {orgName}
            </Text>
          </View>
        </View>

        <View style={styles.main}>
          <TouchableOpacity
            onPress={() => {
              this.navigateTo('MortgageCalculator');
            }}
          >
            <View style={[styles.mainItem, styles.dividingLine]}>
              <Icon name="fangdaijisuanqi" color="#ffc601" size={24} style={{ paddingLeft: 15, paddingRight: 5 }} />
              <Text style={[BaseStyles.block, BaseStyles.text16]}>房贷计算器</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.versionUpdate()}>
            <View style={[styles.mainItem, styles.dividingLine]}>
              <Icon name="jianchagengxin" color="#62cdff" size={24} style={{ paddingLeft: 15, paddingRight: 5 }} />
              <Text style={[BaseStyles.block, BaseStyles.text16]}>检查更新</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.logoutConfirm()}>
            <View style={styles.mainItem}>
              <Icon name="tuichudenglu" color="#4ed5a4" size={24} style={{ paddingLeft: 15, paddingRight: 5 }} />
              <Text style={[BaseStyles.block, BaseStyles.text16]}>退出登录</Text>
            </View>
          </TouchableOpacity>
        </View>

        <DialogBox
          ref={(dialogbox) => { this.dialogbox = dialogbox; }}
        />

        <Toast
          ref={(toast) => { this.toast = toast; }}
          positionValue={screen.height / 2}
          opacity={0.7}
        />
      </View >
    );
  }
}

const styles = StyleSheet.create({
  header: {
    height,
    paddingTop,
    backgroundColor: '#fff',
  },
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    height: 50,
    width: 50,
    marginTop: 60,
    marginBottom: 10,
    borderRadius: 25,
  },
  main: {
    backgroundColor: '#fff',
    marginTop: 10,
  },
  mainItem: {
    flexDirection: 'row',
    height: 55,
    alignItems: 'center',
  },
  // 分割线
  dividingLine: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e7e8ea',
  },
  modelBox: {
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  modelTilteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  tipIcon: {
    width: 34,
  },
  modelTilte: {
    fontSize: 16,
    color: '#3a3a3a',
  },
});
