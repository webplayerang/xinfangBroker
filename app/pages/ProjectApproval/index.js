import React, { PureComponent } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  InteractionManager,
  DeviceEventEmitter,
} from 'react-native';

import axios from 'axios';
import Toast from 'react-native-easy-toast';
import axiosErp from '../../common/AxiosInstance';
import BaseInfo from '../../common/BaseInfo';
import Icon from '../../components/Icon/';
import GoBack from '../../components/GoBack';
import { system, screen } from '../../utils';

export default class ProjectApproval extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerTitle: '项目审批',
      headerLeft: (
        <GoBack
          navigation={navigation}
        />
      ),
      headerRight: (<Text />),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      subscribeCount: 0,
      invoiceBillCount: 0,
    };
  }


  componentDidMount() {
    this.getPrepareAuditCount();// 获取 数量 和权限
    this.listener = DeviceEventEmitter.addListener('ProjectApprovalIndex', () => {
      this.getPrepareAuditCount();
    });
  }

  componentWillUnmount() {
    this.listener.remove();
  }

  // 获取权限
  getAuditPermission() {
    return axiosErp.instance.get('appResource/haveBizAuditPermission')
      .then((res) => res.data);
  }

  getSubscribeCount() {
    return axiosErp.instance.get('appSubscribe/getPrepareAuditNumber')
      .then((res) => res.data.prepareAuditNumber);
  }

  getInvoiceBillCount() {
    return axiosErp.instance.get('appInvoiceBill/getPrepareAuditNumber')
      .then((res) => res.data.prepareAuditNumber);
  }

  getPrepareAuditCount() {
    axios.all([this.getSubscribeCount(), this.getInvoiceBillCount(), this.getAuditPermission()])
      .then(axios.spread((subscribeCount, invoiceBillCount, permission) => {
        this.setState({
          subscribeCount,
          invoiceBillCount,
        });

        BaseInfo.erpPermission = permission;
      },
      ));
  }

  // 跳转路由 公共方法
  navigateTo(route, params = {}) {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  render() {
    const { subscribeCount, invoiceBillCount } = this.state;
    return (
      <View style={styles.container}>
        <Image style={styles.image} source={require('../../assets/img/bg-approval.png')} />
        <View style={styles.main}>
          <TouchableOpacity
            style={[styles.btn, { marginBottom: 10 }]}
            onPress={() => {
              if (invoiceBillCount) {
                this.navigateTo('InvoiceAuditList');
              } else {
                this.toast.show('没有需要审批的内容');
              }
            }}
          >
            <Icon name="kaipiaoshenpi" size={22} color="#fff" />
            <Text style={styles.btnText}>开票审批（{invoiceBillCount}）</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => {
              if (subscribeCount) {
                this.navigateTo('SubscribeAuditList');
              } else {
                this.toast.show('没有需要审批的内容');
              }
            }}
          >
            <Icon name="shangshushenpi" size={22} color="#fff" />
            <Text style={styles.btnText}>上数审批（{subscribeCount}）</Text>
          </TouchableOpacity>
        </View>
        {/* 弹出框 */}
        <Toast
          ref={(toast) => {
            this.toast = toast;
          }}
          positionValue={screen.height / 2}
          opacity={0.7}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
  },
  main: {
    position: 'absolute',
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    height: '50%',
    width: screen.width,
  },
  image: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: null,
    height: null,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  btn: {
    width: 215,
    height: 50,
    backgroundColor: '#ff9911',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingLeft: 30,
  },
  btnText: {
    fontSize: 16,
    color: '#fff',
    paddingLeft: 5,
  },
});
