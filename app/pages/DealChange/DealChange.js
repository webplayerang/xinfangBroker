// 转成交页面
import React from 'react';
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  DeviceEventEmitter,
  InteractionManager,
} from 'react-native';
import { observer } from 'mobx-react/native';
import { autorun, toJS } from 'mobx';
import axios from 'axios';
import Toast from 'react-native-easy-toast';
import RadioForm from 'react-native-simple-radio-button';
import DialogBox from '../../components/react-native-dialogbox';
import GoBack from '../../components/GoBack';
import Icon from '../../components/Icon/';
import ContractStore from '../../stores/Common/Contract';
import GroupPurchaseStore from '../../stores/Common/GroupPurchase';
import DistributinSotre from '../../stores/Common/Distributin';
import SubscribeStore from '../../stores/SubscribeDetail/SubscribeDetail';
import baseStyles from '../../style/BaseStyles';
import { screen } from '../../utils/';
import { getNowFormatDate } from '../../utils/tool';
import ContractView from '../Common/ContractView';
import DistributinView from '../Common/DistributionView';
import GroupPurchaseView from '../Common/GroupPurchaseView';
// 认筹信息录入基本信息页面

@observer
export default class DealChange extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      title: '转成交',
      headerRight: (
        <TouchableOpacity onPress={params.submit}>
          <View style={baseStyles.rightBtn}>
            <Text style={{ fontSize: 16 }}>提交</Text>
          </View>
        </TouchableOpacity>
      ),
      headerLeft: (
        <GoBack navigation={navigation} onBackPress={params.confirm} />
      ),
    };
  };

  constructor(props) {
    super(props);
    this.selectPerson = this.selectPerson.bind(this);
    this.showReport = this.showReport.bind(this);
    this.state = {
      submit: true,
    };
  }

  componentWillMount() {
    const params = this.props.navigation.state.params;
    if (params.subscribeStore) {
      this.subscribeStore = params.subscribeStore;
    }
    if (params.contractStore) {
      this.contractStore = params.contractStore;
    }
    if (params.distributinStore) {
      this.distributinStore = params.distributinStore;
    }
    if (params.groupPurchaseStore) {
      this.groupPurchaseStore = params.groupPurchaseStore;
    }

    // 获取项目负责人
    const { bottomParams } = this.props.navigation.state.params;

    this.subscribeStore.getProjectManager({
      expandId: bottomParams.expandId,
      isManager: 1,
    });

    this.autorunProjectPerson = autorun(() => {
      this.distributinStore.changeProjectPerson({
        projectPersonId: this.subscribeStore.projectManagerId,
        projectPersonName: this.subscribeStore.projectManagerName,
      });

      this.groupPurchaseStore.changeProjectPerson({
        projectPersonId: this.subscribeStore.projectManagerId,
        projectPersonName: this.subscribeStore.projectManagerName,
      });
    });

    this.autorunTotalPrice = autorun(() => {
      this.distributinStore.changeTotalPrice(this.contractStore.totalPrice);
    });
  }
  componentDidMount() {
    this.listener = DeviceEventEmitter.addListener(
      'SubscribeSelectPerson',
      (item) => {
        if (item.type === 'CustomerPersons') {
          // 客户来源
          this.subscribeStore.changeCustomerSource(item);
        } else if (item.type === 'ProjectPersons') {
          // 成交确认人
          this.subscribeStore.changeDealConfirmUserName(item);
        }
      },
    );

    this.contractListener = DeviceEventEmitter.addListener(
      'ContractInfoListener',
      (data) => {
        // 异步获取合同信息
        this.contractStore.setContractInfo(data.data);
      },
    );

    this.distributinListener = DeviceEventEmitter.addListener(
      'GroupPurchaseInfoListener',
      () => {
        // 显示团购费信息
        this.groupPurchaseStore.setInfoVisable(true);
      },
    );

    this.distributinListener = DeviceEventEmitter.addListener(
      'DistributinInfoListener',
      () => {
        // 显示分销信息
        this.distributinStore.setInfoVisable(true);
      },
    );

    this.props.navigation.setParams({
      submit: this.submit.bind(this),
      confirm: () => this.confirm(),
    });
  }
  componentWillUnmount() {
    this.listener.remove();
    this.contractListener.remove();
    this.distributinListener.remove();
    this.autorunProjectPerson();
    this.autorunTotalPrice();
  }

  contractStore = new ContractStore();
  groupPurchaseStore = new GroupPurchaseStore();
  distributinStore = new DistributinSotre();
  subscribeStore = new SubscribeStore();

  confirm() {
    this.dialogbox.confirm({
      title: null,
      content: (
        <View style={styles.modelBox}>
          <View style={styles.modelTilteBox}>
            <Icon
              name="jingshi"
              size={20}
              color="#ffc601"
              style={{ width: 34 }}
            />
            <Text style={styles.modelTilte}>确定要退出吗？</Text>
          </View>
          <View style={styles.modelTextBox}>
            <Text style={styles.modelText}>您填写的内容将不会保存！</Text>
          </View>
        </View>
      ),
      ok: {
        text: '确定',
        style: {
          color: '#ffa200',
          fontSize: 18,
        },
        callback: () => {
          this.props.navigation.goBack();
        },
      },
      cancel: {
        text: '取消',
        style: {
          color: '#3a3a3a',
          fontSize: 18,
        },
      },
    });
  }

  showReport() {
    const { bottomParams } = this.props.navigation.state.params;

    this.dialogbox.confirm({
      title: null,
      content: (
        <View style={styles.modelBox}>
          <View style={styles.modelTilteBox}>
            <Text style={styles.modelTilte}>发布成交喜讯，告诉关注的人此盘正在大卖...</Text>
          </View>
        </View>
      ),
      ok: {
        text: '好的',
        style: {
          color: '#ffa200',
          fontSize: 18,
        },
        callback: () => {
          this.props.navigation.navigate('ReleaseReport', {
            reservationId: bottomParams.reservationId,
            expandId: bottomParams.expandId,
            gardenName: bottomParams.gardenName,
            type: 'CJXX',
            key: this.props.navigation.state.key,
          });
        },
      },
      cancel: {
        text: '下次吧',
        style: {
          color: '#3a3a3a',
          fontSize: 18,
        },
        callback: () => {
          this.toast.show('处理成功！');
          setTimeout(() => {
            this.props.navigation.goBack();
          }, 1500);
        },
      },
    });
  }

  submit() {
    if (this.state.submit) {
      const { bottomParams } = this.props.navigation.state.params;
      // 获取基础分销信息
      const baseInfo = this.subscribeStore;
      if (!baseInfo.dealConfirmUserId) {
        this.toast.show('请选择成交确认人!');
        return;
      }

      if (!baseInfo.customerSourceId) {
        this.toast.show('请选择客户来源!');
        return;
      }
      // 合同信息和分销信息 要录
      if (!this.contractStore.totalPrice) {
        this.toast.show('请录入合同信息!');
        return;
      }
      if (!this.groupPurchaseStore.groupPrice) {
        this.toast.show('请录入团购费分佣信息!');
        return;
      }
      // 综合类型时
      if (this.subscribeStore.sourceType === 'COMBINATION') {
        if (!this.distributinStore.brokerageProportion) {
          this.toast.show('请录入分销分佣信息!');
          return;
        }
      }
      const params = {
        operateType: bottomParams.operateType || 'ADD',
        expandId: bottomParams.expandId,
        recognitionId: bottomParams.recognitionId,
        reservationId: bottomParams.reservationId,
        projectManagerId: baseInfo.projectManagerId,
        projectManagerName: baseInfo.projectManagerName,
        dealConfirmUserErpId: baseInfo.dealConfirmUserId,
        dealConfirmUserName: baseInfo.dealConfirmUserName,
        customerSource: baseInfo.customerSourceId,
        sourceType: baseInfo.sourceType,

        subscribeId: bottomParams.subscribeId,
        incomeInfoId: bottomParams.incomeInfoId,
        settleInfoId: bottomParams.settleInfoId,
        filingId: bottomParams.filingId,
        reservationCustomerRecordId: bottomParams.reservationCustomerRecordId,
      };

      // 获取合同信息
      const contractInfo = this.contractStore;
      const subscribeContract = {
        dealCustomerId: contractInfo.dealCustomerId,
        dealCustomerName: contractInfo.dealCustomerName,
        dealCustomerPhone: contractInfo.dealCustomerPhone,
        payType: contractInfo.payTypeId,
        buyDate: contractInfo.buyDate,
        roomId: contractInfo.roomId,
        roomNumber: contractInfo.roomNumber,
        area: +contractInfo.area,
        totalPrice: contractInfo.totalPrice,
        createDate: contractInfo.createDate, // 签约日期

        // 额外属性
        contractId: bottomParams.contractId,
        dealNumber: bottomParams.dealNumber,
        customerSource: bottomParams.customerSource,
        contractNumber: bottomParams.contractNumber,
        roomRecordId: bottomParams.roomRecordId,
      };

      // 合并参数
      params.subscribeContract = subscribeContract;
      // 综合类型时
      if (this.subscribeStore.sourceType === 'COMBINATION') {
        params.distributionCommissionVo = this.distributinStore.buildFormData();
      }
      params.groupCommission = this.groupPurchaseStore.buildFormData();
      // 提交数据
      this.setState({ submit: false });
      axios
        .post('/subscribe/add', params)
        .then((res) => {
          if (res.data.status === 'C0000') {
            DeviceEventEmitter.emit('DealDetailsRefresh');
            DeviceEventEmitter.emit('RecognitionDetailsRefresh');
            this.showReport();
          } else {
            this.setState({ submit: true });
            this.toast.show(`处理失败, ${res.data.message}`);
          }
        })
        .catch((e) => {
          this.setState({ submit: true });
          this.toast.show(`处理失败, ${res.data.message}`);
        });
    }
  }

  selectPerson(params) {
    const { navigate } = this.props.navigation;
    navigate('SelectPicker', {
      title: params.title,
      url: params.url,
      selected: params.selected,
      params: params.params || {},
      event: 'SubscribeSelectPerson',
      type: params.type,
    });
  }

  goGroupPurchase() {
    const { bottomParams } = this.props.navigation.state.params;
    if (!this.groupPurchaseStore.infoVisable) {
      this.groupPurchaseStore.changeDistributionPerson({
        personId: bottomParams.distributionPersonId,
        personName: bottomParams.distributionPersonName,
      });
    }

    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate('GroupPurchase', {
        reservationId: bottomParams.reservationId,
        store: this.groupPurchaseStore,
      });
    });
  }

  goDistributin() {
    if (!this.contractStore.totalPrice) {
      this.toast.show('请先录入合同信息!');
      return;
    }
    const { bottomParams } = this.props.navigation.state.params;
    if (!this.distributinStore.infoVisable) {
      this.distributinStore.changeDistributionPerson({
        personId: bottomParams.distributionPersonId,
        personName: bottomParams.distributionPersonName,
      });
    }
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate('Distributin', {
        reservationId: bottomParams.reservationId,
        store: this.distributinStore,
      });
    });
  }

  render() {
    const { navigate } = this.props.navigation;
    const { bottomParams } = this.props.navigation.state.params;
    return (
      <View style={baseStyles.container}>
        <ScrollView>
          <View style={baseStyles.comTitleOutBox}>
            <View style={baseStyles.comTitleBox}>
              <Text style={baseStyles.comTitle}>基础分销信息</Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.list]}>
            <View>
              <Text style={styles.comLeftTxt}>报备客户：</Text>
            </View>
            <View>
              <Text style={styles.comRightTxt}>
                {bottomParams.reservationCustomerName}
              </Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.list]}>
            <View>
              <Text style={styles.comLeftTxt}>项目负责人：</Text>
            </View>
            <View>
              <Text style={styles.comRightTxt}>
                {bottomParams.projectManagerName}
              </Text>
            </View>
          </View>

          {
            bottomParams.operateType === 'UPDATE' ?
              (
                <View style={[baseStyles.borderTop, styles.list]}>
                  <View>
                    <Text style={styles.comLeftTxt}>成交确认人：</Text>
                  </View>
                  <View>
                    <Text style={styles.comRightTxt}>
                      {this.subscribeStore.dealConfirmUserName}
                    </Text>
                  </View>
                </View>
              )
              : (
                <TouchableOpacity
                  onPress={() => {
                    this.selectPerson({
                      title: '成交确认人',
                      url: '/common/projectPersons',
                      type: 'ProjectPersons',
                      selected: this.subscribeStore.dealConfirmUserId,
                      params: {
                        expandId: bottomParams.expandId,
                      },
                    });
                  }}
                >
                  <View style={[baseStyles.borderTop, styles.formItem]}>
                    <Text style={styles.paramTxt}>成交确认人：</Text>
                    {
                      /* <TextInput
                        style={styles.formInput}
                        placeholder="请选择"
                        value={this.subscribeStore.dealConfirmUserName}
                        placeholderTextColor="#a8a8a8"
                        underlineColorAndroid="transparent"
                        editable={false}
                        />
                    */
                    }
                    <View style={styles.selectBox}>
                      {
                        this.subscribeStore.dealConfirmUserName ?
                          (
                            <Text style={styles.selectText}>
                              {this.subscribeStore.dealConfirmUserName}
                            </Text>
                          ) :
                          (
                            <Text style={[styles.selectText, styles.ca8]}>请选择</Text>
                          )
                      }
                    </View>
                    <View style={styles.rightIcon}>
                      <Icon name="arrow-right" size={16} color="#3a3a3a" />
                    </View>
                  </View>
                </TouchableOpacity>
              )}

          {
            bottomParams.operateType === 'UPDATE' ?
              (
                <View style={[baseStyles.borderTop, styles.list]}>
                  <View>
                    <Text style={styles.comLeftTxt}>客户来源：</Text>
                  </View>
                  <View>
                    <Text style={styles.comRightTxt}>
                      {this.subscribeStore.customerSource}
                    </Text>
                  </View>
                </View>
              ) :
              (
                <TouchableOpacity
                  onPress={() => {
                    this.selectPerson({
                      title: '客户来源',
                      url: '/common/customerSources',
                      selected: this.subscribeStore.customerSourceId,
                      type: 'CustomerPersons',
                    });
                  }}
                >
                  <View style={[baseStyles.borderTop, styles.formItem]}>
                    <Text style={styles.paramTxt}>客户来源：</Text>
                    {
                      /* <TextInput
                      style={styles.formInput}
                      placeholder="请选择"
                      value={this.subscribeStore.customerSource}
                      placeholderTextColor="#a8a8a8"
                      underlineColorAndroid="transparent"
                      editable={false}
                    />
                    */
                    }
                    <View style={styles.selectBox}>
                      {
                        this.subscribeStore.customerSource ?
                          (
                            <Text style={styles.selectText}>
                              {this.subscribeStore.customerSource}
                            </Text>
                          ) :
                          (
                            <Text style={[styles.selectText, styles.ca8]}>请选择</Text>
                          )
                      }
                    </View>
                    <View style={styles.rightIcon}>
                      <Icon name="arrow-right" size={16} color="#3a3a3a" />
                    </View>
                  </View>
                </TouchableOpacity>
              )}

          {
            bottomParams.operateType === 'UPDATE' ?
              (
                <View style={[baseStyles.borderTop, styles.list]}>
                  <View>
                    <Text style={styles.comLeftTxt}>业务类型：</Text>
                  </View>
                  <View>
                    <Text style={styles.comRightTxt}>
                      {this.subscribeStore.sourceType === 'RECOGNITION'
                        ? '电商'
                        : '综合'}
                    </Text>
                  </View>
                </View>
              ) :
              (
                <View style={styles.rowWithBorder}>
                  <Text style={[styles.content, styles.contentLabel]}>
                    业务类型：
                  </Text>
                  <RadioForm
                    style={{ flex: 2, justifyContent: 'space-between' }}
                    radio_props={[
                      { label: '电商', value: 0 },
                      { label: '综合', value: 1 },
                    ]}
                    initial={
                      this.subscribeStore.sourceType === 'RECOGNITION' ? 0 : 1
                    }
                    formHorizontal
                    buttonColor={'#FFC601'}
                    selectedButtonColor={'#FFC601'}
                    labelStyle={styles.radioButton}
                    onPress={(value) => {
                      this.subscribeStore.changeSourceType(value);
                    }}
                    buttonSize={13}
                  />
                </View>
              )
          }

          <TouchableOpacity
            onPress={() => {
              if (!this.contractStore.isShow) {
                this.contractStore.dealCustomerName =
                  bottomParams.dealCustomerName;
                this.contractStore.dealCustomerPhone =
                  bottomParams.dealCustomerPhone;
                this.contractStore.buyDate = getNowFormatDate();
              }
              navigate('Contract', {
                expandId: bottomParams.expandId,
                data: toJS(this.contractStore),
              });
            }}
          >
            <View style={[styles.list, styles.pr0, { marginTop: 10 }]}>
              <View>
                <Text style={styles.titleTxt}>合同信息</Text>
              </View>
              <View style={styles.rightBtn}>
                <Text style={baseStyles.btnOrangeTxt}>
                  {this.contractStore.isShow ? '修改' : '开始录入'}
                </Text>
                <View style={styles.rightIcon}>
                  <Icon name="arrow-right" size={16} color="#3a3a3a" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
          {this.contractStore.isShow && ContractView(this.contractStore)}

          <TouchableOpacity onPress={() => this.goGroupPurchase()}>
            <View
              style={[
                styles.list,
                styles.pr0,
                baseStyles.borderBt,
                { marginTop: 10 },
              ]}
            >
              <View>
                <Text style={styles.titleTxt}>团购费分佣信息：</Text>
              </View>
              <View style={styles.rightBtn}>
                <Text style={baseStyles.btnOrangeTxt}>
                  {this.groupPurchaseStore.infoVisable ? '修改' : '开始录入'}
                </Text>
                <View style={styles.rightIcon}>
                  <Icon name="arrow-right" size={16} color="#3a3a3a" />
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {
            this.groupPurchaseStore.infoVisable &&
            GroupPurchaseView(this.groupPurchaseStore)}

          {
            this.subscribeStore.sourceType === 'COMBINATION' ? (
              <TouchableOpacity onPress={() => this.goDistributin()}>
                <View
                  style={[
                    styles.list,
                    styles.pr0,
                    baseStyles.borderBt,
                    { marginTop: 10 },
                  ]}
                >
                  <View>
                    <Text style={styles.titleTxt}>分销分佣信息</Text>
                  </View>
                  <View style={styles.rightBtn}>
                    <Text style={baseStyles.btnOrangeTxt}>
                      {this.distributinStore.infoVisable ? '修改' : '开始录入'}
                    </Text>
                    <View style={styles.rightIcon}>
                      <Icon name="arrow-right" size={16} color="#3a3a3a" />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ) : null}
          {
            this.distributinStore.infoVisable &&
            this.subscribeStore.sourceType === 'COMBINATION' &&
            DistributinView(this.distributinStore)
          }
        </ScrollView>
        <Toast
          ref={(c) => {
            this.toast = c;
          }}
          positionValue={screen.height / 2}
          opacity={0.7}
        />
        <DialogBox
          ref={(dialogbox) => {
            this.dialogbox = dialogbox;
          }}
        />
      </View>
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
    flex: 1,
    color: '#3a3a3a',
    height: '100%',
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

  infoItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    height: 44,
    alignItems: 'center',
    flexDirection: 'row',
  },
  leftWidth: {
    width: 88,
  },
  leftWider: {
    width: 120,
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
  modelTilte: {
    fontSize: 16,
    color: '#3a3a3a',
  },
  modelTextBox: {
    marginLeft: 30,
    paddingVertical: 4,
  },
  modelText: {
    fontSize: 16,
    color: '#7e7e7e',
  },
  rowWithBorder: {
    width: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: 15,
    paddingRight: 15,
    height: 55,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e9e9eb',
  },
  radioButton: {
    fontSize: 16,
    width: 80,
  },
  content: {
    flex: 1,
  },
  contentLabel: {
    fontSize: 16,
    color: '#7E7E7E',
  },
});
