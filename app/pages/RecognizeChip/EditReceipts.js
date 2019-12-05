import React, { Component } from 'react';
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  DeviceEventEmitter,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { observer } from 'mobx-react/native';
import RadioForm from 'react-native-simple-radio-button';
import Toast from 'react-native-easy-toast';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// 友盟统计
import { UMNative } from '../../common/NativeHelper';
import GoBack from '../../components/GoBack';
import Icon from '../../components/Icon/';
import MyDatePicker from '../../components/MyDatePicker';
import baseStyles from '../../style/BaseStyles';
import EditReceiptsStore from '../../stores/RecognizeChip/EditReceipt';
// 新增编辑收款信息
@observer
class EditReceipts extends Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      title: '收款信息',
      headerRight: (
        <TouchableOpacity onPress={() => params.comfirmRecognition()}>
          <View style={baseStyles.rightBtn}>
            <Text style={{ fontSize: 16 }}>确定</Text>
          </View>
        </TouchableOpacity>
      ),
      headerLeft: (<GoBack navigation={navigation} />),
    };
  };

  componentDidMount() {
    // 统计页面时长
    UMNative.onPageBegin('EDIT_RECOGNIZE');
    // 避免重复提交标识
    this.confirmFlag = true;
    this.props.navigation.setParams({
      comfirmRecognition: this.comfirmRecognition.bind(this),
    });
    // 获取选择的值
    this.listener = DeviceEventEmitter.addListener('ReceiptsSelect', (item) => {
      switch (item.type) {
        case 'CustomerSelect':
          this.receiptsStore.changeNoteNumber(item.name);
          break;
        case 'note':
          this.receiptsStore.changeNote(item);
          break;
        // 系统参考号
        case 'refNumber':
          this.receiptsStore.changeRefNumber(item.refNumber);
          break;
        case 'posBankAccount':
          this.receiptsStore.changePosBankAccount(item);
          break;
        case 'turnBankAccount':
          this.receiptsStore.changeTurnBankAccount(item);
          break;
        case 'gatheringBank':
          this.receiptsStore.changeGatheringBank(item);
          break;
        default:
          this.receiptsStore.changeSelectItem(item);
          break;
      }
    });
  }

  componentWillUnmount() {
    // 统计页面时长
    UMNative.onPageEnd('EDIT_RECOGNIZE');
    this.listener.remove();
  }
  // 确定按钮操作 一种本地保存 一种服务器请求提交
  comfirmRecognition() {
    const { params = {} } = this.props.navigation.state;
    const incomeBillsData = this.receiptsStore.saveReceipts();
    const toast = this.refs.toast;
    if (!this.confirmFlag) {
      return;
    }
    if (!incomeBillsData.incomePrice) {
      toast.show('请输入收款金额!');
      return;
    }
    if (incomeBillsData.incomePrice <= 0) {
      toast.show('收款金额必须大于0!');
      return;
    }
    if (!incomeBillsData.payAccountName) {
      toast.show('请输入交款账户名!');
      return;
    }
    if (!incomeBillsData.noteNumber) {
      toast.show('请选择收据号!');
      return;
    }
    if (!incomeBillsData.gatheringType) {
      toast.show('请选择收款方式!');
      return;
    }
    if (!incomeBillsData.businessEntityId) {
      toast.show('请选择业务实体!');
      return;
    }

    if (incomeBillsData.gatheringType === 'POS') {
      if (!incomeBillsData.terminalNumber) {
        toast.show('请输入终端号!');
        return;
      }
      if (!incomeBillsData.refNumber || incomeBillsData.refNumber.length !== 12) {
        toast.show('请输入12位系统参考号');
        return;
      }
    }
    if (incomeBillsData.gatheringType === 'TRANSFER') {
      if (!incomeBillsData.gatheringBank) {
        toast.show('请选择收款银行!');
        return;
      }
    }
    if (!incomeBillsData.bankAccountId) {
      toast.show('请选择银行账号!');
      return;
    }
    if (incomeBillsData.gatheringType === 'TRANSFER') {
      if (!incomeBillsData.businessNumber) {
        toast.show('请输入交易流水号!');
        return;
      }
    }
    if (!incomeBillsData.operatorErpId) {
      toast.show('请选择经办人!');
      return;
    }
    if (!incomeBillsData.gatheringDate) {
      toast.show('请选择收款时间!');
      return;
    }
    //  判断是本地保存还是提交服务器
    if (params.editNeed) {
      this.sumbitRecognition(incomeBillsData, params.editNeed);
    } else {
      this.saveRecognition(incomeBillsData);
    }
    this.confirmFlag = false;
  }
  saveRecognition(incomeBillsData) {
    const { goBack } = this.props.navigation;
    DeviceEventEmitter.emit('IncomeBillsListener', { incomeBillsData });
    this.confirmFlag = false;
    this.refs.toast.show('保存成功');
    setTimeout(() => { goBack(); }, 1500);
  }
  sumbitRecognition(incomeBillsData, editNeed) {
    const { goBack } = this.props.navigation;
    const toast = this.refs.toast;
    this.confirmFlag = false;
    this.receiptsStore.setLoading();
    const sendParams = this.receiptsStore.getSendParams(editNeed);

    // 统计修改页面-保存按钮点击数
    UMNative.onEvent('EDIT_SUBMIT_RECOGNIZE_COUNT');
    axios.post('recognition/add', sendParams).then((res) => {
      if (res.data.status === 'C0000') {
        toast.show('认筹编辑成功!');
        this.receiptsStore.cancelLoading();
        DeviceEventEmitter.emit('RecognitionDetailsRefresh');
        setTimeout(() => { goBack(); }, 1500);
      } else {
        this.confirmFlag = true;
        this.receiptsStore.cancelLoading();
        toast.show(`认筹编辑失败, ${res.data.message}`);
      }
    }).catch(() => {
      this.confirmFlag = true;
      this.receiptsStore.cancelLoading();
      toast.show('服务器异常');
    });
  }
  receiptsStore = new EditReceiptsStore(this.props);
  // render
  render() {
    const navigation = this.props.navigation;
    const { params = {} } = navigation.state;
    const expandId = params.expandId;
    return (
      <KeyboardAwareScrollView>
        <ScrollView >
          {/* 收款金额 */}
          <View style={[styles.formItem, styles.fmMt]}>
            <Text style={styles.paramTxt}>收款金额：</Text>
            <TextInput
              style={[styles.formInput, styles.fmPr]}
              placeholder="请输入"
              placeholderTextColor="#a8a8a8"
              keyboardType="numeric"
              underlineColorAndroid="transparent"
              onChangeText={(text) => this.receiptsStore.changeIncomePrice(text)}
              defaultValue={this.receiptsStore.incomePrice}
            />
          </View>

          {/* 交款账户名 */}
          <View style={[baseStyles.borderTop, styles.formItem]}>
            <Text style={styles.paramTxt}>交款账户名：</Text>
            <TextInput
              style={[styles.formInput, styles.fmPr]}
              placeholder="请输入"
              placeholderTextColor="#a8a8a8"
              underlineColorAndroid="transparent"
              onChangeText={(text) => this.receiptsStore.changePayAccountName(text)}
              defaultValue={this.receiptsStore.payAccountName}
            />
          </View>

          {/* 收据号 */}
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('ReceiptNumber', {
                title: '选择收据号',
                url: '/common/notes',
                type: 'note',
                event: 'ReceiptsSelect',
                params: { expandId },
              });
            }}
          >
            <View style={[baseStyles.borderTop, styles.formItem]}>
              <Text style={styles.paramTxt}>收据号：</Text>
              {/* <TextInput
              style={styles.formInput}
              placeholder="请选择"
              placeholderTextColor="#a8a8a8"
              underlineColorAndroid="transparent"
              editable={false}
              defaultValue={this.receiptsStore.noteNumber}
            /> */}
              <View style={styles.selectBox}>
                {this.receiptsStore.noteNumber ?
                  <Text style={styles.selectText}>
                    {this.receiptsStore.noteNumber}
                  </Text>
                  :
                  <Text style={[styles.selectText, styles.ca8]}>请选择</Text>
                }
              </View>
              <View style={styles.rightIcon} ><Icon name="arrow-right" size={16} color="#3a3a3a" /></View>
            </View>
          </TouchableOpacity>
          {/* 收款方式
        单选pos机和转账，pos选项下终端号ReceiptNumber.js，系统参考号SystemNumber.js，银行账号
        转账选项下 收款银行，银行账号，交易流水号
        */}
          <View style={[baseStyles.borderTop, styles.formItem]}>
            <Text style={styles.paramTxt}>收款方式：</Text>
            <RadioForm
              style={{
                flex: 1, justifyContent: 'flex-end',
              }}
              radio_props={this.receiptsStore.payTypePropOptions}
              initial={this.receiptsStore.gatheringType}
              formHorizontal
              buttonColor={'#FFC601'}
              selectedButtonColor={'#FFC601'}
              buttonSize={10}
              labelStyle={styles.radioButton}
              onPress={(value) => { this.receiptsStore.changePayType(value); }}
            />
          </View>

          {/* 收款方式 end  */}
          {/* 业务实体 当pos机选项时跟银行账号有关系 common/businessEntities */}
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('SelectPicker', {
                title: '业务实体',
                url: '/common/businessEntities',
                type: 'businessEntity',
                selected: this.receiptsStore.businessEntityId,
                event: 'ReceiptsSelect',
              });
            }}
          >
            <View style={[baseStyles.borderTop, styles.formItem]}>
              <Text style={styles.paramTxt}>业务实体：</Text>
              <View style={styles.selectBox}>
                {this.receiptsStore.businessEntityName ?
                  <Text style={styles.selectText}>
                    {this.receiptsStore.businessEntityName}
                  </Text>
                  :
                  <Text style={[styles.selectText, styles.ca8]}>请选择</Text>
                }
              </View>
              <View style={styles.rightIcon} ><Icon name="arrow-right" size={16} color="#3a3a3a" /></View>
            </View>
          </TouchableOpacity>
          {/* pos机 */}
          {this.receiptsStore.gatheringType === 0 &&
            <View>
              <View style={[baseStyles.borderTop, styles.formItem]}>
                <Text style={styles.paramTxt}>终端号：</Text>
                <TextInput
                  style={[styles.formInput, styles.fmPr]}
                  placeholder="请输入"
                  keyboardType="numeric"
                  placeholderTextColor="#a8a8a8"
                  underlineColorAndroid="transparent"
                  defaultValue={this.receiptsStore.terminalNumber}
                  onChangeText={(text) => this.receiptsStore.changeTerminalNumber(text)}
                />
              </View>
              <View style={[baseStyles.borderTop, styles.formItem]}>
                <Text style={styles.paramTxt}>系统参考号：</Text>
                <View style={styles.selectBox}>
                  {/* {this.receiptsStore.refNumber ?
                  <Text style={styles.selectText}>
                    {this.receiptsStore.refNumber}
                  </Text>
                  :
                  <Text style={[styles.selectText, styles.ca8]}>请选择</Text>
                } */}
                  <TextInput
                    style={[styles.formInput, styles.fmPr]}
                    placeholder="请输入"
                    maxLength={12}
                    keyboardType="numeric"
                    placeholderTextColor="#a8a8a8"
                    underlineColorAndroid="transparent"
                    defaultValue={this.receiptsStore.refNumber}
                    onChangeText={(text) => this.receiptsStore.changeRefNumber(text)}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.rightIcon, { height: 50, justifyContent: 'center' }]}
                  onPress={() => {
                    navigation.navigate('SystemNumber', {
                      title: '系统参考号',
                      url: '/common/relNumberList',
                      type: 'refNumber',
                      event: 'ReceiptsSelect',
                      params: { pageSize: 1000 },
                    });
                  }}
                >
                  {/* <Icon name="xitongcankaohao" size={24} color="#f91" /> */}
                  <View style={{
                    width: 30,
                    height: 30,
                    borderColor: '#ffc601',
                    borderWidth: StyleSheet.hairlineWidth,
                    borderRadius: 5,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  ><Text style={{ color: '#ffc601', fontSize: 16, fontWeight: 'bold' }}>选</Text></View>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (!this.receiptsStore.businessEntityId) {
                    this.refs.toast.show('请先选择业务实体!');
                    return;
                  }
                  navigation.navigate('SelectPicker', {
                    title: '银行账号',
                    url: '/recognition/postAccounts',
                    type: 'posBankAccount',
                    event: 'ReceiptsSelect',
                    selected: this.receiptsStore.posBankAccountId,
                    params: { businessEntityId: this.receiptsStore.businessEntityId },
                  });
                }}
              >
                <View style={[baseStyles.borderTop, styles.formItem]}>
                  <Text style={styles.paramTxt}>银行账号：</Text>
                  {/* <TextInput
                  style={styles.formInput}
                  placeholder="请选择"
                  placeholderTextColor="#a8a8a8"
                  underlineColorAndroid="transparent"
                  editable={false}
                  defaultValue={this.receiptsStore.posBankAccountNumber}
                /> */}
                  <View style={styles.selectBox}>
                    {this.receiptsStore.posBankAccountNumber ?
                      <Text style={styles.selectText}>
                        {this.receiptsStore.posBankAccountNumber}
                      </Text>
                      :
                      <Text style={[styles.selectText, styles.ca8]}>请选择</Text>
                    }
                  </View>
                  <View style={styles.rightIcon} ><Icon name="arrow-right" size={16} color="#3a3a3a" /></View>
                </View>
              </TouchableOpacity>
            </View>

          }
          {/* 转账 */}
          {this.receiptsStore.gatheringType === 1 &&
            <View>
              <TouchableOpacity
                onPress={() => {
                  if (!this.receiptsStore.businessEntityId) {
                    this.refs.toast.show('请先选择业务实体!');
                    return;
                  }
                  navigation.navigate('SelectPicker', {
                    title: '收款银行',
                    url: '/recognition/transferBanks',
                    type: 'gatheringBank',
                    selected: this.receiptsStore.gatheringBankId,
                    event: 'ReceiptsSelect',
                    params: { businessEntityId: this.receiptsStore.businessEntityId },
                  });
                }}
              >
                <View style={[baseStyles.borderTop, styles.formItem]}>
                  <Text style={styles.paramTxt}>收款银行：</Text>
                  <View style={styles.selectBox}>
                    {this.receiptsStore.gatheringBank ?
                      <Text style={styles.selectText}>
                        {this.receiptsStore.gatheringBank}
                      </Text>
                      :
                      <Text style={[styles.selectText, styles.ca8]}>请选择</Text>
                    }
                  </View>
                  <View style={styles.rightIcon} ><Icon name="arrow-right" size={16} color="#3a3a3a" /></View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (!this.receiptsStore.businessEntityId) {
                    this.refs.toast.show('请先选择业务实体!');
                    return;
                  }
                  if (!this.receiptsStore.gatheringBank) {
                    this.refs.toast.show('请先选择收款银行!');
                    return;
                  }
                  navigation.navigate('SelectPicker', {
                    title: '银行账号',
                    url: '/recognition/transferBankAccounts',
                    type: 'turnBankAccount',
                    selected: this.receiptsStore.turnBankAccountId,
                    event: 'ReceiptsSelect',
                    params: {
                      businessEntityId: this.receiptsStore.businessEntityId,
                      gatheringBank: this.receiptsStore.gatheringBank,
                    },
                  });
                }}
              >
                <View style={[baseStyles.borderTop, styles.formItem]}>
                  <Text style={styles.paramTxt}>银行账号：</Text>
                  <View style={styles.selectBox}>
                    {this.receiptsStore.turnBankAccountNumber ?
                      <Text style={styles.selectText}>
                        {this.receiptsStore.turnBankAccountNumber}
                      </Text>
                      :
                      <Text style={[styles.selectText, styles.ca8]}>请选择</Text>
                    }
                  </View>
                  <View style={styles.rightIcon} ><Icon name="arrow-right" size={16} color="#3a3a3a" /></View>
                </View>
              </TouchableOpacity>
              <View style={[baseStyles.borderTop, styles.formItem]}>
                <Text style={styles.paramTxt}>交易流水号：</Text>
                <TextInput
                  style={[styles.formInput, styles.fmPr]}
                  placeholder="请输入"
                  placeholderTextColor="#a8a8a8"
                  underlineColorAndroid="transparent"
                  defaultValue={this.receiptsStore.businessNumber}
                  onChangeText={(text) => this.receiptsStore.changeBusinessNumber(text)}
                />
              </View>
            </View>
          }
          {/* 经办人 编辑过来的图标红色并且和上一个表单项有10像素距离,后需求取消修改和编辑的区别 common/projectPersons */}
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('SelectPicker', {
                title: '经办人',
                url: '/common/projectPersons',
                type: 'operatorErp',
                event: 'ReceiptsSelect',
                selected: this.receiptsStore.operatorErpId,
                params: { expandId },
              });
            }}
          >
            <View style={[baseStyles.borderTop, styles.formItem]}>
              <Text style={styles.paramTxt}>经办人：</Text>
              <View style={styles.selectBox}>
                {this.receiptsStore.operatorErpName ?
                  <Text style={styles.selectText}>
                    {this.receiptsStore.operatorErpName}
                  </Text>
                  :
                  <Text style={[styles.selectText, styles.ca8]}>请选择</Text>
                }
              </View>
              <View style={styles.rightIcon} ><Icon name="arrow-right" size={16} color="#3a3a3a" /></View>
            </View>
          </TouchableOpacity>

          {/* 收款时间 */}
          <View style={[baseStyles.borderTop, styles.formItem, { justifyContent: 'space-between' }]}>
            <Text style={styles.paramTxt}>收款时间：</Text>
            <View style={{ paddingRight: 15 }}>
              <MyDatePicker value={this.receiptsStore.gatheringDate} onChangeText={(text) => { this.receiptsStore.changeGatheringDate(text); }} />
            </View>
          </View>
          <Toast ref="toast" position="center" opacity={0.7} />
          {this.receiptsStore.loading &&
            (
              <View style={baseStyles.overlayLoad} >
                <ActivityIndicator size="large" color="white" style={{ marginTop: -150 }} />
              </View>
            )
          }
        </ScrollView >
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  selectBox: {
    padding: 0,
    margin: 0,
    flex: 1,
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
  },
  selectText: {
    flex: 1,
    fontSize: 16,
    textAlign: 'right',
  },
  ca8: {
    color: '#a8a8a8',
  },
  contentValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fmMt: {
    marginTop: 10,
  },
  fmPr: {
    paddingRight: 15,
  },
  list: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    height: 54,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleTxt: {
    fontSize: 16,
    color: '#7e7e7e',
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
  comLeftTxt: {
    color: '#7e7e7e',
    fontSize: 16,
  },
  comRightTxt: {
    color: '#3a3a3a',
    fontSize: 16,
  },
  pr0: {
    paddingRight: 0,
  },
  rightIcon: {
    paddingRight: 15,
    paddingLeft: 5,
  },
  rightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    paddingLeft: 15,
  },
  radioButton: {
    fontSize: 16,
    width: 70,
  },
  radio: {
    padding: 10,
    borderWidth: 2,
    borderColor: '#FFC601',
    borderRadius: 12,
    marginRight: 10,
  },
});

export default EditReceipts;
