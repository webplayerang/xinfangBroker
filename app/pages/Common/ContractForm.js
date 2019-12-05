import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableHighlight,
  TouchableOpacity,
  TextInput,
  DeviceEventEmitter,
} from 'react-native';
import { observer } from 'mobx-react';
import axios from 'axios';
import Toast from 'react-native-easy-toast';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ContractStore from '../../stores/Common/Contract';
import Icon from '../../components/Icon/';
import baseStyles from '../../style/BaseStyles';
import MyDatePicker from '../../components/MyDatePicker';
// import { screen } from '../../utils';
// import { getDaysInOneMonth } from '../../utils/tool';
// import { KeyboardAwareListView } from '../../../node_modules/react-native-keyboard-aware-scroll-view/index';
@observer
export default class Contract extends Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerTintColor: '#3A3A3A',
      title: '合同录入',
      headerRight: (
        <TouchableOpacity onPress={() => params.saveContract()}>
          <View style={baseStyles.rightBtn}>
            <Text style={{ fontSize: 16 }}>确定</Text>
          </View>
        </TouchableOpacity>
      ),
    };
  };

  constructor(props) {
    super(props);
    this.selectPicker = this.selectPicker.bind(this);
    this.requetDate = this.requetDate.bind(this);
  }

  componentDidMount () {
    this.listener = DeviceEventEmitter.addListener('select', (item) => {
      if (item.type === 'PayType') {
        this.cStore.changePayType(item);
      }
    });

    // 获取房间号
    this.roomListener = DeviceEventEmitter.addListener('RoomNumber', (item) => {
      this.cStore.changeRoom(item);
      const area = String(item.area.toFixed(2));
      this.cStore.changeArea(area.replace('.00', ''));
    });

    this.props.navigation.setParams({
      saveContract: this.saveContract.bind(this),
    });

    // 请求认购日期区间
    this.requetDate();
  }

  componentWillUnmount () {
    this.listener.remove();
    this.roomListener.remove();
  }

  requetDate () {
    const expandId = this.props.navigation.state.params.expandId;
    this.cStore.requestDate(expandId);
  }

  // 保存合同信息
  saveContract () {
    const { goBack } = this.props.navigation;
    const data = this.cStore.saveContract();
    if (!data.dealCustomerName) {
      this.refs.toast.show('请输入成交客户!');
      return;
    }

    if (!data.dealCustomerPhone) {
      this.refs.toast.show('请输入联系方式!');
      return;
    }

    if (!data.payTypeId) {
      this.refs.toast.show('请选择付款方式!');
      return;
    }

    if (!data.buyDate) {
      this.refs.toast.show('请输入选择认购日期!');
      return;
    }

    // if (!data.createDate) {
    //   this.refs.toast.show('请选择签约日期!');
    //   return;
    // }

    if (!data.roomId) {
      this.refs.toast.show('请选择房号!');
      return;
    }

    if (!data.area) {
      this.refs.toast.show('请输入面积!');
      return;
    }

    if (data.area <= 0) {
      this.refs.toast.show('面积必须大于0!');
      return;
    }

    if (!data.totalPrice) {
      this.refs.toast.show('请输入成交总价!');
      return;
    }

    if (data.totalPrice <= 0) {
      this.refs.toast.show('成交总价必须大于0!');
      return;
    }

    const flag = this.props.navigation.state.params.flag;
    const sendData = this.props.navigation.state.params.sendData;
    // flag 用于判断是从（报备详情，认筹详情 ADD）还是成交详情页面(UPDATE)进来
    if (flag) {
      // 提交合同
      const params = {
        operateType: 'UPDATE',
        expandId: data.expandId,
        reservationId: data.reservationId,
        projectManagerId: data.projectManagerId,
        projectManagerName: data.projectManagerName,
        dealConfirmUserErpId: data.dealConfirmUserErpId,
        dealConfirmUserName: data.dealConfirmUserName,
        customerSource: data.customerSource,
      };

      const distributionCommissionVo = sendData.distributionCommission; // 分销信息
      const groupCommission = sendData.groupCommission; // 团购分佣信息

      const subscribeContract = {
        dealCustomerName: data.dealCustomerName,
        dealCustomerPhone: data.dealCustomerPhone,
        payType: data.payTypeId,
        buyDate: data.buyDate,
        roomId: data.roomId,
        roomNumber: data.roomNumber,
        area: +data.area,
        totalPrice: data.totalPrice,
        createDate: data.createDate, // 签约日期
      };

      params.subscribeContract = subscribeContract;
      params.groupCommission = groupCommission;
      params.distributionCommissionVo = distributionCommissionVo;

      // 提交数据
      axios
        .post('/subscribe/add', params)
        .then((res) => {
          this.setState({ submit: false });
          if (res.data.status === 'C0000') {
            this.refs.toast.show('修改成功！');
            this.props.navigation.goBack();
          } else {
            this.refs.toast.show(`修改失败, ${res.data.message}`);
          }
        })
        .catch(() => {
          this.refs.toast.show('修改失败');
        });
    } else {
      DeviceEventEmitter.emit('ContractInfoListener', { data });
      goBack();
    }
  }

  selectPicker (params) {
    const { navigate } = this.props.navigation;
    navigate('SelectPicker', {
      title: '付款方式',
      url: params.url,
      selected: this.cStore.payTypeId,
      event: 'select',
      type: 'PayType',
    });
  }

  cStore = new ContractStore(this.props.navigation.state.params.data);

  render () {
    const { navigate } = this.props.navigation;
    const { params } = this.props.navigation.state;
    return (
      <KeyboardAwareScrollView>
        <ScrollView style={styles.container}>
          <View style={styles.separated} />
          <View style={styles.separated} />
          <View style={styles.rowWithBorder}>
            <Text style={styles.paramTxt}>成交客户 : </Text>
            <TextInput
              style={[styles.formInput, styles.fmPr]}
              value={this.cStore.dealCustomerName}
              placeholder="请输入"
              placeholderTextColor="#a8a8a8"
              underlineColorAndroid="transparent"
              onChangeText={(text) => this.cStore.changeDealCustomerName(text)}
            />
          </View>
          <View style={styles.rowWithBorder}>
            <Text style={styles.paramTxt}>联系方式 : </Text>
            <TextInput
              style={[styles.formInput, styles.fmPr]}
              value={this.cStore.dealCustomerPhone}
              placeholder="请输入"
              keyboardType="numeric"
              maxLength={11}
              placeholderTextColor="#a8a8a8"
              underlineColorAndroid="transparent"
              onChangeText={(text) => this.cStore.changeDealCustomerPhone(text)}
            />
          </View>
          <View style={styles.rowWithBorder}>
            <Text style={[styles.content, styles.contentLabel]}>
              付款方式 :
            </Text>
            <TouchableHighlight
              style={[
                styles.contentValue,
                {
                  width: '70%',
                  paddingVertical: 15,
                  justifyContent: 'flex-end',
                },
              ]}
              underlayColor="#f0f0f0"
              onPress={() => this.selectPicker({ url: '/common/payTypes' })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text>{this.cStore.payTypeValue}</Text>
                <Icon name="arrow-right" size={20} color="#3a3a3a" />
              </View>
            </TouchableHighlight>
          </View>

          <View style={styles.rowWithBorder}>
            <Text style={[styles.content, styles.contentLabel]}>
              认购日期 :
            </Text>
            <View style={styles.contentValue}>
              {this.cStore.minDate.length > 0 ? (
                <MyDatePicker
                  value={this.cStore.buyDate}
                  minDate={this.cStore.minDate}
                  maxDate={this.cStore.maxDate}
                  onChangeText={(text) => {
                    this.cStore.changeBuyDate(text);
                  }}
                />
              ) : null}
            </View>
          </View>

          <View style={styles.rowWithBorder}>
            <Text style={[styles.content, styles.contentLabel]}>
              签约日期 :
            </Text>
            <View style={styles.contentValue}>
              <MyDatePicker
                value={this.cStore.createDate}
                onChangeText={(text) => {
                  this.cStore.changeCreateDate(text);
                }}
              />
            </View>
          </View>

          <View style={styles.rowWithBorder}>
            <Text style={[styles.content, styles.contentLabel]}>房号 : </Text>
            {
              params.operateType === 'UPDATE' ?
                (
                  <TextInput
                    style={[styles.formInput, styles.fmPr]}
                    value={this.cStore.roomNumber}
                    editable={false}
                    placeholderTextColor="#a8a8a8"
                    underlineColorAndroid="transparent"
                  />
                ) :
                (
                  <TouchableHighlight
                    style={[
                      styles.contentValue,
                      {
                        width: '70%',
                        paddingVertical: 15,
                        justifyContent: 'flex-end',
                      },
                    ]}
                    underlayColor="#f0f0f0"
                    onPress={() =>
                      navigate('RoomPicker', { expandId: params.expandId })
                    }
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text>{this.cStore.roomDesc || this.cStore.roomNumber}</Text>
                      <Icon name="arrow-right" size={20} color="#3a3a3a" />
                    </View>
                  </TouchableHighlight>
                )}
          </View>
          <View style={styles.rowWithBorder}>
            <Text style={[styles.content, styles.contentLabel]}>面积 : </Text>
            <View style={styles.contentValue}>
              <TextInput
                value={this.cStore.area}
                underlineColorAndroid="transparent"
                placeholder="请输入"
                width={100}
                keyboardType="numeric"
                onChangeText={(text) => this.cStore.changeArea(text)}
              />
              <Text style={styles.contentRight}> ㎡</Text>
            </View>
          </View>
          <View style={styles.rowWithBorder}>
            <Text style={[styles.content, styles.contentLabel]}>
              成交总价 :{' '}
            </Text>
            <View style={styles.contentValue}>
              <TextInput
                value={this.cStore.totalPrice}
                underlineColorAndroid="transparent"
                placeholder="请输入"
                width={100}
                keyboardType="numeric"
                onChangeText={(text) => this.cStore.changeTotalPrice(text)}
              />
              <Text style={styles.contentRight}> 元</Text>
            </View>
          </View>
          <Toast ref="toast" position="center" opacity={0.7} />
        </ScrollView>
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: '#F6F5FA',
  },
  headerRight: {
    color: '#3A3A3A',
  },
  row: {
    height: 56,
    width: '100%',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    flexDirection: 'row',
  },
  rowWithBorder: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: 15,
    paddingRight: 15,
    height: 55,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e7e8ea',
  },
  rowWithButton: {
    height: 44,
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  separated: {
    height: 10,
    width: '100%',
  },
  subtitle: {
    fontSize: 18,
    color: '#A8A8A8',
    marginLeft: 12,
  },
  flag: {
    backgroundColor: '#FFC601',
    width: 3,
    height: 42,
  },
  content: {
    flex: 1,
  },
  totalPriceLabel: {
    marginLeft: 15,
    fontSize: 17,
    color: '#3A3A3A',
  },
  totalPrice: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FDC800',
  },
  contentLabel: {
    fontSize: 16,
    color: '#7E7E7E',
  },
  contentValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentRight: {
    fontSize: 16,
    color: '#3B3B3B',
  },

  fmMt: {
    marginTop: 10,
  },
  fmPr: {
    paddingRight: 15,
  },
  paramTxt: {
    width: 'auto',
    fontSize: 16,
    color: '#7e7e7e',
  },
  formItem: {
    paddingLeft: 15,
    backgroundColor: '#fff',
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E9E9EB',
  },
  formInput: {
    fontSize: 16,
    padding: 0,
    margin: 0,
    height: '100%',
    flex: 1,
    color: '#3a3a3a',
    textAlign: 'right',
  },
});
