import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  InteractionManager,
  ScrollView,
  DeviceEventEmitter,
  ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-easy-toast';
// import CheckBox from 'react-native-check-box';
import RadioForm from 'react-native-simple-radio-button';
// 友盟统计
import axiosErp from '../../common/AxiosInstance';
import BaseInfo from '../../common/BaseInfo';

import MonthPicker from '../../components/MonthPicker';
import MyDatePicker from '../../components/MyDatePicker';
import DialogBox from '../../components/react-native-dialogbox';

import OtherReasonInput from './OtherReasonInput';

import Icon from '../../components/Icon/';
import GoBack from '../../components/GoBack';

import BaseStyles from '../../style/BaseStyles';
import { screen } from '../../utils';

// 认筹详情页面

export default class SubscribeAuditDetail extends PureComponent {
  // static propTypes = {
  //   navigation: PropTypes.object,
  // }

  // static defaultProps = {
  //   navigation: {},
  // }
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      title: '审批详情',
      headerLeft: (<GoBack navigation={navigation} />),
      headerRight: (<Text />),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      startDate: (new Date()).toLocaleDateString().replace(/\//g, '-'),
      monthPickerFlag: false,
      loading: true,
      subscribeBillData: {},
      radio_props: [],
      // radio_props: [
      //   { label: '客户填写不规范', value: 0 },
      //   { label: '佣金分配不符合公司要求', value: 1 },
      //   { label: '其他', value: 2 },
      // ],
    };

    this.clickButtonFlag = false;
    this.performanceMonth = '';
    this.disagreeReasonObj = {};
    this.monthPicker = MonthPicker;
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(this.requestData.bind(this));
  }
  componentWillUnmount() {

  }


  getReasons() {
    const { subscribeBillData } = this.state;
    axiosErp.instance.get('appReason/getReasons', {
      params: {
        id: subscribeBillData.subscribe.id,
        number: subscribeBillData.subscribe.contract.number,
        type: 'SUBSCRIBE',
      },
    })
      .then((res) => {
        this.clickButtonFlag = false;
        this.disagreeReasonObj = res.data;
        this.alertConfirmDisagree(res.data);
      });
  }

  // monthPicker组件需要的遮罩层
  monthPickerOverlay() {
    if (this.state.monthPickerFlag) {
      return (
        <TouchableOpacity
          activeOpacity={1}
          style={{
            zIndex: 1000,
            opacity: 1,
            width: '100%',
            height: screen.height,
          }}
          onPress={() => {
            this.monthPicker.hide();
            this.setState({
              monthPickerFlag: false,
            });
          }}
        />
      );
    }
    return null;
  }

  requestData() {
    const { id } = this.props.navigation.state.params; // 成交单id


    axiosErp.instance.get('appSubscribe/getSubscribe', { params: { id } })
      .then((res) => {
        this.setState({
          loading: false,
          subscribeBillData: res.data,
        });
      });
    // .catch(() => {
    //   this.setState({
    //     loading: false,
    //   });
    //   this.toast.show('服务器异常');
    // });
  }

  initDatePicker() {
    const data = [[], []];
    for (let i = 2000; i <= 2030; i += 1) {
      data[0].push(i);
    }
    for (let i = 1; i <= 12; i += 1) {
      data[1].push(i);
    }
    MonthPicker.picker({
      pickerData: data,
      onPickerConfirm: () => {
        this.setState({
          monthPickerFlag: false,
        });
        if (this.currentPicker === 1) {
          this.setState({
            startDate: MonthPicker.value.join('-'),
          });
          this.startDateText.setState({
            date: MonthPicker.value.join('-'),
          });
        } else if (this.currentPicker === 2) {
          this.setState({
            endDate: MonthPicker.value.join('-'),
          });
          this.endDateText.setState({
            date: MonthPicker.value.join('-'),
          });
        }
      },
      onPickerCancel: () => {
        this.setState({
          monthPickerFlag: false,
        });
      },
    });
  }

  // 驳回 确认弹出框
  alertConfirmDisagree(data) {
    this.setState({
      radio_props: data.selectableReasons.map((item) => Object.assign(item, {
        isChecked: false,
        label: item.option,
        value: item.option,
      })),
    });


    this.dialogbox.confirm({
      title: null,
      content: (
        <View style={styles.modelBox}>
          <View style={styles.modelBoxTitle}>
            <Text style={[BaseStyles.text16, BaseStyles.black]}>驳回原因</Text>
          </View>

          <View style={styles.modelBoxMain}>
            <RadioForm
              style={{ width: '100%', paddingLeft: 60 }}
              radio_props={this.state.radio_props}
              initial={-1}
              formHorizontal={false}
              buttonColor={'#FFC601'}
              selectedButtonColor={'#FFC601'}
              labelStyle={styles.radioLabel}
              buttonSize={10}
              onPress={(value) => { this.selectReason(value); }}
            />
            <OtherReasonInput ref={(otherReasonInput) => { this.otherReasonInput = otherReasonInput; }} />


          </View>
        </View>
      ),
      cancel: {
        text: '取消',
        style: {
          color: '#3a3a3a',
          fontSize: 18,
        },
        callback: () => {
          this.dialogbox.close();
        },
      },
      ok: {
        text: '确认',
        style: {
          fontSize: 18,
          color: '#ffa200',
        },
        callback: () => {
          // 接口成功失败后关闭窗口
          let isCommit = false;
          let rollbackRecordOptions = [];

          this.state.radio_props.forEach((item, index) => {
            rollbackRecordOptions.push({
              reason: {
                id: item.id,
              },
              // content: item.option,
              isChecked: item.isChecked ? 'YES' : 'NO',
            });
            if (item.isChecked) {
              if (item.option !== '其它') {
                isCommit = true;
              } else if (this.otherReasonInput.getValue()) {
                isCommit = true;
                rollbackRecordOptions[index].content = this.otherReasonInput.getValue();
              } else {
                this.toast.show('请输入驳回原因');
                return false;
              }
            }
          });
          rollbackRecordOptions = JSON.stringify(rollbackRecordOptions); // 后台需要的

          if (isCommit) {
            // this.dialogbox.close();

            this.doAudit({
              processStatus: 'DISAGREE',
              rollbackRecord: {
                target: this.disagreeReasonObj.target,
              },
              rollbackRecordOptions,
            });
          } else {
            this.toast.show('请选择驳回原因');
          }
        },
      },
    });
  }

  showPicker(value) {
    const data = value.split('-');
    this.monthPicker.show(data);
    this.setState({
      monthPickerFlag: true,
    });
  }

  changeperformanceMonth(date) {
    this.performanceMonth = date;
  }

  // 通过 确认弹出框
  alertConfirmAgree(needDate) {
    const { subscribeBillData } = this.state;
    const performanceMonthDefault = this.dateFormat(subscribeBillData.subscribe.createTime);

    this.changeperformanceMonth(performanceMonthDefault);
    this.dialogbox.confirm({
      title: null,
      content: (
        <View style={styles.modelBox}>
          {
            needDate ?
              (
                <View style={styles.modelBoxTitle}>
                  <Text style={[BaseStyles.text16, BaseStyles.black]}>业绩日期确认</Text>
                </View>
              )
              :
              (
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  <Icon name="jingshi" size={20} color="#ffc601" style={{ width: 34 }} />
                  <Text style={[BaseStyles.text16, BaseStyles.black]}>确认审批通过吗？</Text>
                </View>
              )
          }

          {
            needDate ?
              (
                <View style={styles.modelBoxMain}>
                  <TouchableOpacity
                    style={styles.datePickerContainer}
                    onPress={() => this.showPicker(this.state.startDate)}
                  >
                    <Text style={[BaseStyles.text14, BaseStyles.deepGray]}>业绩日期确认</Text>
                    <View style={{ flexDirection: 'row' }} >
                      <MyDatePicker
                        style={{ width: 140 }}
                        value={performanceMonthDefault} //
                        minDate={subscribeBillData.minPerformanceDate}
                        maxDate={subscribeBillData.maxPerformanceDate}
                        onChangeText={(text) => {
                          this.changeperformanceMonth(text);
                        }}
                      />
                      {/* <View style={styles.confirmDate} >
                        <StartDateText
                          textStyle={[BaseStyles.text14, BaseStyles.black]}
                          date={this.state.startDate}
                          ref={(startDateText) => { this.startDateText = startDateText; }}
                        />
                      </View>
                      <View><Icon name="rili" size={16} color="#a8a8a8" /></View> */}
                    </View>
                  </TouchableOpacity>

                </View>

              ) : null
          }

        </View>
      ),
      cancel: {
        text: '取消',
        style: {
          color: '#3a3a3a',
          fontSize: 18,
        },
        callback: () => {
          this.dialogbox.close();
        },
      },
      ok: {
        text: '确认',
        style: {
          fontSize: 18,
          color: '#ffa200',
        },
        callback: () => {
          // 接口成功失败后关闭窗口
          // this.dialogbox.close();

          if (needDate) {
            this.doAudit({
              processStatus: 'AGREE',
              performanceMonth: this.performanceMonth,
            });
          } else {
            this.doAudit({
              processStatus: 'AGREE',
            });
          }
        },
      },
    });
  }

  doAudit(data) {
    const resultStr = data.processStatus === 'AGREE' ? '审批成功' : '驳回成功';
    const { subscribeBillData } = this.state;

    const params = {
      id: subscribeBillData.subscribe.id,
      type: 'BIZ',
      ...data,
    };

    axiosErp.instance.get('appSubscribe/doAudit',
      {
        params,
      })
      .then((res) => {
        if (res.data.success) {
          this.dialogbox.close();
          DeviceEventEmitter.emit('SubscribeAuditList', resultStr);
          DeviceEventEmitter.emit('ProjectApprovalIndex');
          DeviceEventEmitter.emit('ProjectApproval');
          this.props.navigation.goBack();
        } else {
          this.toast.show(res.data.message);
        }
      });
  }

  // 跳转路由 公共方法
  navigateTo(route, params = {}) {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }


  // 转换为 YYYY-MM-DD
  dateFormat(timer) {
    const date = new Date(timer);
    const year = date.getFullYear();
    const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();

    return `${year}-${month}-${day}`;
  }

  selectReason(data) {
    this.state.radio_props.forEach((item) => {
      item.isChecked = false;
      if (item.option === data) {
        item.isChecked = true;
      }
    });
    if (data === '其它') {
      this.otherReasonInput.toggleVisible(true);
    } else {
      this.otherReasonInput.toggleVisible(false);
    }
  }


  renderMain() {
    const { subscribeBillData } = this.state;
    if (Object.keys(subscribeBillData).length === 0) {
      return null;
    }

    const { contract } = subscribeBillData.subscribe;
    const { room } = contract;
    const unitName = room.unit ? room.unit.name : '';


    return (
      <ScrollView style={[styles.container, { marginBottom: BaseInfo.erpPermission.subscribeBizAudit ? 45 : 0 }]}>
        <View style={[styles.commonHeader, { marginTop: 10 }]}>
          <View style={styles.leftYellow}>
            <Text style={styles.commonTitle}>{subscribeBillData.filing.project.garden.name}</Text>
          </View>
        </View>

        <View style={styles.main}>
          <View style={styles.mainHeader}>
            <Text style={styles.mainHeaderText}>分销信息</Text>
          </View>


          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>报备经纪人：</Text>
            <Text style={styles.mainContent}>
              {subscribeBillData.filing.filingPerson.name}
            </Text>
          </View>

          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>经纪人公司：</Text>
            <Text style={styles.mainContent}>
              {subscribeBillData.filing.filingPerson.company.name}
            </Text>
          </View>

          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>成交确认人：</Text>
            <Text style={styles.mainContent}>
              {subscribeBillData.confirmer.name}
            </Text>
          </View>

          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>项目负责人：</Text>
            <Text style={styles.mainContent}>
              {subscribeBillData.filing.project.manager.name}
            </Text>
          </View>
        </View>

        <View style={styles.main}>
          <View style={styles.mainHeader}>
            <Text style={styles.mainHeaderText}>合同信息</Text>
          </View>
          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>成交客户：</Text>
            <Text style={styles.mainContent}>{contract.customer.name}</Text>
          </View>

          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>联系方式：</Text>
            <Text style={styles.mainContent}>
              {contract.customer.phone}
            </Text>
          </View>

          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>认购日期：</Text>
            <Text style={styles.mainContent}>
              {this.dateFormat(contract.buyDate)}
            </Text>
          </View>

          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>房号：</Text>
            <Text style={styles.mainContent}>
              {`${contract.room.building.name}${unitName}${contract.room.roomCode}`}
            </Text>
          </View>

          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>成交总价：</Text>
            <Text style={styles.mainContent}>
              {contract.totalPrice}元
            </Text>
          </View>
        </View>

        <View style={[styles.main, { marginBottom: 10 }]}>
          <View style={styles.mainHeader}>
            <Text style={styles.mainHeaderText}>分佣信息</Text>
          </View>
          <TouchableOpacity
            style={styles.lastBtn}
            onPress={() => {
              this.navigateTo('CommissionInformation', { subscribeBillData });
            }}
          >
            <Text style={[BaseStyles.gray, BaseStyles.text14]}>
              {subscribeBillData.existCommission ? '分销款分佣信息' : ''}
              {subscribeBillData.existCommission && subscribeBillData.existGroupon ? '/' : ''}
              {subscribeBillData.existGroupon ? '团购费分佣信息' : ''}
            </Text>
            <Icon name="arrow-right" size={16} color="#3a3a3a" />

          </TouchableOpacity>
        </View>

      </ScrollView>
    );
  }


  render() {
    const { subscribeBillData } = this.state;
    return (
      <View style={BaseStyles.container}>
        {this.monthPickerOverlay()}
        {this.renderMain()}

        {
          BaseInfo.erpPermission.subscribeBizAudit ? (

            <View style={styles.bottomBar}>
              <TouchableOpacity
                style={[styles.bottomBtn, { backgroundColor: '#fff' }]}
                onPress={() => {
                  if (!this.clickButtonFlag) {
                    this.clickButtonFlag = true;
                    this.getReasons();
                  }
                }}
              >
                <Text style={[BaseStyles.text16, BaseStyles.black]}>驳回</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bottomBtn, { backgroundColor: '#ffc601' }]}
                onPress={() => this.alertConfirmAgree(subscribeBillData.isShowPerformanceDateDialog)}
              >
                <Text style={[BaseStyles.text16, BaseStyles.white]}>通过</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }


        {
          this.state.loading &&
          (
            <View style={BaseStyles.overlayLoad} >
              <ActivityIndicator size="large" color="white" style={{ marginTop: -150 }} />
            </View>
          )
        }
        <Toast ref={(toast) => { this.toast = toast; }} position="center" opacity={0.7} />

        <DialogBox ref={(dialogbox) => { this.dialogbox = dialogbox; }} />
      </View>
    );
  }
}


const styles = StyleSheet.create({
  commonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 66,
    backgroundColor: '#fff',


  },
  leftYellow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderLeftWidth: 3,
    borderLeftColor: '#ffc601',
  },
  commonTitle: {
    paddingLeft: 12,
    fontSize: 18,
    color: '#3a3a3a',
  },

  container: {
    width: '100%',
  },

  main: {
    flex: 1,
    alignItems: 'flex-start',
    paddingHorizontal: 15,
    marginTop: 10,
    backgroundColor: '#fff',
  },
  mainHeader: {
    paddingVertical: 20,
  },
  mainHeaderText: {
    fontSize: 16,
  },


  mainItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e7e8ea',
  },
  mainLabel: {
    color: '#a8a8a8',
    fontSize: 14,
    width: '25%',
  },
  mainContent: {
    color: '#3a3a3a',
    fontSize: 14,
    width: '75%',
  },
  lastBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e7e8ea',
  },
  invoiceRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e7e8ea',
  },
  bottomBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '50%',
    height: 45,
  },
  modelBox: {
    width: '100%',
  },
  modelBoxTitle: {
    paddingLeft: 15,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 45,
    width: '100%',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e7e8ea',
  },
  modelBoxMain: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },

  radioForm: {
    width: '100%',
    height: 100,
    justifyContent: 'space-between',
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingLeft: 70,
  },

  radioLabel: {
    fontSize: 14,
    color: '#3a3a3a',
    width: '100%',
  },

  formInput: {
    height: 100,
    fontSize: 16,
    padding: 0,
    marginTop: 15,
    color: '#3a3a3a',
    textAlignVertical: 'top',
    backgroundColor: '#000',
  },


  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f9',
    height: 30,
    width: '80%',
    borderRadius: 5,
    borderColor: '#dedfe0',
    borderWidth: 1,
    paddingHorizontal: 15,
  },
  confirmDate: {
    paddingRight: 10,
    alignItems: 'center',
  },
});

