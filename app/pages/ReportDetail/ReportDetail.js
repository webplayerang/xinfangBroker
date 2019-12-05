import React, { PureComponent } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  InteractionManager,
  FlatList,
  ScrollView,
  Dimensions,
  DeviceEventEmitter,
  ActivityIndicator,
  Clipboard,
  Linking,
  TextInput,
} from 'react-native';
import axios from 'axios';
import Toast from 'react-native-easy-toast';
import KeyboardSpacer from 'react-native-keyboard-spacer';

// 友盟统计
import { UMNative } from '../../common/NativeHelper';
import GoBack from '../../components/GoBack';
import Icon from '../../components/Icon';
import DialogBox from '../../components/react-native-dialogbox';
import system from '../../utils/system';
import baseStyles from '../../style/BaseStyles';
import ReportDetailBottom from './ReportDetailBottom';
import ReportShareInfo from './ReportShareInfo';
import ShareAlertDialog from './ShareAlertDialog';

const { width, height } = Dimensions.get('window');

// 报备详情页面

class ReportDetail extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      title: '报备详情',
      headerRight: (
        <TouchableOpacity onPress={() => params.onSharePress()}>
          <View style={baseStyles.rightBtn}>
            <Icon name="fenxiang" size={20} color="#7e7e7e" />
          </View>
        </TouchableOpacity>
      ),
      headerLeft: (<GoBack navigation={navigation} onBackPress={() => params.navigateBack && params.navigateBack()} />),
    };
  };

  constructor(props) {
    super(props);
    const { params = {} } = props.navigation.state;
    this.openFlag = true;
    this.state = {
      loading: true,
      reportDetailData: {},
      showSharePop: false,
      explainPopStatus: false,
      ExplaninText: '',
    };
    this.reservationId = params.reservationId;
    this.source = params.source || '';
    this.onExplainPopState = this.onExplainPopState.bind(this);
    this.onExplainRequest = this.onExplainRequest.bind(this);
    this.onChangeText = this.onChangeText.bind(this);
    this.requestData = this.requestData.bind(this);
  }

  componentDidMount () {
    this.props.navigation.setParams({
      onSharePress: this.onSharePress.bind(this),
      navigateBack: this.navigateBack.bind(this),
    });
    InteractionManager.runAfterInteractions(this.requestData);
    // setTimeout(this.requestData, 3e3);
  }

  // 控制客户意向弹窗的展示
  onExplainPopState () {
    const { explainPopStatus } = this.state;
    this.setState({
      explainPopStatus: !explainPopStatus,
    });
  }
  // 发送客户意向请求
  async onExplainRequest () {
    const { explainPopStatus, ExplaninText } = this.state;

    try {
      await axios.get('reservation/updateReservationRemark', { params: { reservationId: this.reservationId, remark: ExplaninText } });
      this.setState({
        explainPopStatus: !explainPopStatus,
      });
    } catch (err) {
      console.log(err);
    }
  }

  onSharePress () {
    this.setState({ showSharePop: !this.state.showSharePop });
  }
  // 获取客户意向弹窗文本
  onChangeText (text) {
    this.setState({
      ExplaninText: text,
    });
  }
  async setClipboardContent (shareStr) {
    Clipboard.setString(shareStr);
    const url = 'weixin://';
    Linking.canOpenURL(url).then((supported) => {
      if (!supported) {
        // QFReactHelper.show('当前版本不支持拨打号码或发送短信', 5);
      } else {
        return Linking.openURL(url);
      }
    }).catch((err) => console.log(`未知错误${err}`));
  }
  async validate () {
    this.setState({
      loading: true,
    });
    const validateData = await axios.get('common/checkDataForTrade', { params: { reservationId: this.reservationId } })
      .then((res) => {
        this.setState({
          loading: false,
        });
        if (res.data.status === 'C0000') {
          // 通过验证
          res.data.validateFlag = false;
        } else {
          res.data.validateFlag = true;
        }
        return res.data;
      }).catch(() => {
        this.setState({
          loading: false,
        });
        this.refs.toast.show('服务器异常');
      });
    return validateData;
  }
  navigateBack () {
    if (this.source === 'QrCode') {
      this.props.navigation.navigate('TabHome');
    } else {
      this.props.navigation.goBack();
    }
  }
  smsBroker (shareStr) {
    let url = '';
    if (system.isIOS) {
      url = `sms:&body=${shareStr}`;
    } else {
      url = `sms:?body=${shareStr}`;
    }

    Linking.canOpenURL(url).then((supported) => {
      if (!supported) {
        this.refs.toast.show('当前版本不支持拨打号码或发送短信');
      } else {
        return Linking.openURL(url);
      }
    }).catch((err) => console.log(`未知错误${err}`));
  }
  // 分享文字处理
  formatShareTxt () {
    const reportDetailData = this.state.reportDetailData;
    let shareStr = `Q房新房案场报备信息\n报备项目：${reportDetailData.gardenName || ''}\n客户：${reportDetailData.customerName}\n电话：${reportDetailData.customerPhone}\n`;
    shareStr += `经纪人：${reportDetailData.brokerName}\n电话：${reportDetailData.brokerPhone}\n归属：${reportDetailData.companyName || ''}${reportDetailData.storeName || ' '}\n`;
    shareStr += `报备时间：${reportDetailData.submitTime && reportDetailData.submitTime.substring(0, 16)}`;
    if (reportDetailData.appointmentTime) {
      shareStr += `\n到访时间：${reportDetailData.appointmentTime.substring(0, 16)}`;
    }
    return shareStr;
  }

  // 分享 底部弹窗以及分享功能
  openShare (type) {
    const shareTxt = this.formatShareTxt();
    this.dialogbox.confirm({
      title: null,
      content: <ReportShareInfo reportDetailData={this.state.reportDetailData} />,
      ok: {
        text: '去粘贴',
        style: {
          color: '#ffa200',
          fontSize: 18,
        },
        callback: () => {
          // 统计分享页面按钮点击数
          UMNative.onEvent('SHARE_COUNT');
          if (type === 'wx') {
            this.setClipboardContent(shareTxt);
          }
          if (type === 'dx') {
            this.smsBroker(shareTxt);
          }
          this.openFlag = true;
          this.dialogbox.close();
        },
      },
      cancel: {
        text: '不分享',
        style: {
          color: '#3a3a3a',
          fontSize: 18,
        },
        callback: () => {
          this.openFlag = true;
          this.dialogbox.close();
        },
      },
    });
  }

  // 上数和认筹的验证
  openTip (text) {
    this.refs.toast.show(text);
  }

  // 报备确认带看确认带看延期弹出窗
  openModel (titleTxtStr, urlStr) {
    // if (!this.openFlag) {
    //   return;
    // }
    this.openFlag = false;
    const detail = this.state.reportDetailData;
    let okText;
    let okCallback;
    let cancelText;
    let cancelCallback;
    // 根据事件调用时的传参来判断弹窗显示的title文字，按钮文字，以及按钮事件
    // reservationConfirm 报备确认
    // guideConfirm 带看确认
    // againGuideConfirm 重新带看
    if (urlStr === 'reservationConfirm') {
      okText = '报备成功';
      cancelText = '报备重复';
      okCallback = () => {
        axios.get('reservation/reservationConfirm', { params: this.reportParams })
          .then((res1) => {
            // 接口成功失败后关闭窗口
            this.dialogbox.close();
            this.openFlag = true;
            if (res1.data.status !== 'C0000') {
              this.refs.toast.show('操作失败！');
              return;
            }
            this.refs.toast.show('操作成功！');
            // 接口成功后关闭窗口刷新报备详情页
            this.requestData();
            DeviceEventEmitter.emit('LatestReport');
            DeviceEventEmitter.emit('DailyGardenList');
            DeviceEventEmitter.emit('PersonalReportList');
          });
      };
      cancelCallback = () => {
        // 请求报备重复接口/reservation/reservationRepeat
        axios.get('reservation/reservationRepeat', { params: this.reportParams })
          .then((res1) => {
            // 接口成功失败关闭窗口
            this.dialogbox.close();
            if (res1.data.status !== 'C0000') {
              this.refs.toast.show('操作失败！');
              return;
            }
            this.refs.toast.show('操作成功！');
            // 接口成功后关闭窗口刷新报备详情页
            this.requestData();
            DeviceEventEmitter.emit('LatestReport');
            DeviceEventEmitter.emit('DailyGardenList');
            DeviceEventEmitter.emit('PersonalReportList');
          });
      };
    } else if (urlStr === 'guideConfirm') {
      okText = '带看成功';
      cancelText = '未带看';
      okCallback = () => {
        axios.get('reservation/guideConfirm', {
          params: {
            reservationId: this.reservationId,
            guideStatus: 'YES',
          },
        })
          .then((res1) => {
            // 接口成功失败后关闭窗口
            this.dialogbox.close();
            this.openFlag = true;
            // 统计带看确认点击数
            UMNative.onEvent('GUIDE_CONFIRM_COUNT');

            if (res1.data.status !== 'C0000') {
              this.refs.toast.show('操作失败！');
              return;
            }
            this.refs.toast.show('操作成功！');
            // 接口成功后关闭窗口刷新报备详情页
            this.requestData();
            DeviceEventEmitter.emit('DailyGardenList');
            DeviceEventEmitter.emit('PersonalReportList');
          });
      };
      cancelCallback = () => {
        axios.get('reservation/guideConfirm', {
          params: {
            reservationId: this.reservationId,
            guideStatus: 'NO',
          },
        })
          .then((res1) => {
            // 接口成功失败后关闭窗口
            this.dialogbox.close();
            this.openFlag = true;
            // 统计带看确认点击数
            UMNative.onEvent('GUIDE_CONFIRM_COUNT');

            if (res1.data.status !== 'C0000') {
              this.refs.toast.show('操作失败！');
              return;
            }
            this.refs.toast.show('操作成功！');
            // 接口成功后关闭窗口刷新报备详情页
            this.requestData();
            DeviceEventEmitter.emit('DailyGardenList');
            DeviceEventEmitter.emit('PersonalReportList');
          });
      };
    } else if (urlStr === 'againGuideConfirm') {
      okText = '带看确认';
      cancelText = '取消';
      okCallback = () => {
        axios.get('reservation/guideConfirm', {
          params: {
            reservationId: this.reservationId,
            guideStatus: 'YES',
          },
        })
          .then((res1) => {
            // 接口成功失败后关闭窗口
            this.dialogbox.close();
            this.openFlag = true;
            // 统计带看确认点击数
            UMNative.onEvent('GUIDE_CONFIRM_COUNT');

            if (res1.data.status !== 'C0000') {
              this.refs.toast.show('操作失败！');
              return;
            }
            this.refs.toast.show('操作成功！');
            // 接口成功后关闭窗口刷新报备详情页
            this.requestData();
            DeviceEventEmitter.emit('DailyGardenList');
            DeviceEventEmitter.emit('PersonalReportList');
          });
      };
      cancelCallback = () => {
        this.dialogbox.close();
      };
    }

    this.dialogbox.confirm({
      title: null,
      content: <View style={styles.modelBox}>
        <View style={styles.modelTilteBox}><Icon name="jingshi" size={20} color="#ffc601" /><Text style={styles.modelTilte}>{titleTxtStr}</Text></View>
        <View style={styles.modelTextBox}><Text style={styles.modelText}>客户：{detail.customerName}</Text></View>
        <View style={styles.modelTextBox}><Text style={styles.modelText}>电话：{detail.customerPhone}</Text></View>
      </View>,
      ok: {
        text: okText,
        style: {
          color: '#ffa200',
          fontSize: 18,
        },
        callback: () => {
          okCallback();
        },
      },
      cancel: {
        text: cancelText,
        style: {
          color: '#3a3a3a',
          fontSize: 18,
        },
        // style: baseStyles.cancel,
        callback: () => {
          cancelCallback();
        },
      },
    });
  }

  // 客户手机号中间4位为****
  // formatPhone(phone) {
  //   return phone && `${phone.substr(0, 3)}****${phone.substr(7)}`;
  // }


  // 获取当前带看报备信息
  requestData () {
    // 123941 报备确认 ==已经处理到团购上数了 123911带看确认按钮 2791272团购上数按钮
    // params.reservationId = 123911;
    this.reportParams = { reservationId: this.reservationId };
    axios.get('reservation/reservationDetail', { params: this.reportParams })
      .then((res) => {
        this.setState({
          loading: false,
        });
        if (res.data.status !== 'C0000') {
          this.refs.toast.show('请求失败！');
          return;
        }
        const result = res.data.result;
        // result.formatPhone = this.formatPhone(result.customerPhone) || '';
        this.setState({
          reportDetailData: result,
          ExplaninText: result.remark,
        });
      }).catch(() => {
        this.setState({
          loading: false,
        });
        this.refs.toast.show('服务器异常');
      });
  }
  // 渲染操作记录列表单条记录
  renderOperationLogs ({ item }) {
    return (
      <View style={[baseStyles.borderTop, styles.list]} >
        <View>
          <Text style={styles.comImpListTxt}>{item.operationType}</Text>
        </View>
        <View>
          <Text style={styles.comListTxt}>{item.operationUser}    {item.operationTime && item.operationTime.substring(0, 16)}</Text>
        </View>
      </View>
    );
  }

  render () {
    const navigation = this.props.navigation;
    // const watchDelayStr = '确认重新带看此客户吗？';
    const detailData = this.state.reportDetailData;
    const operationLogs = detailData.operationLogs || [];
    const bottomParams = {
      reservationId: detailData.reservationId,
      status: detailData.status,
      expandId: detailData.expandId,
      dealCustomerName: detailData.customerName,
      dealCustomerPhone: detailData.customerPhone,
      projectManagerId: detailData.projectManagerId,
      projectManagerName: detailData.projectManagerName,
      distributionPersonId: detailData.employeeId, // 分销人员 ID
      distributionPersonName: detailData.brokerName, // 分销人员姓名
      gardenName: detailData.gardenName,
    };
    const { explainPopStatus, ExplaninText } = this.state;
    return (
      <View style={[baseStyles.container, { justifyContent: 'space-between', flex: 1, position: 'relative' }]} >

        <ScrollView>
          {/* 报备人 */}
          <View style={[styles.personBg]} />
          <View style={styles.personOuter}>
            <View style={styles.personBox}>
              {/* 头像 */}
              {/* <Image style={styles.avatar} source={require('../../assets/img/head.png')} /> */}
              {/* 信息 */}
              <View style={styles.personInfo}>
                <View style={{
                  paddingRight: 90,
                  flexDirection: 'row',
                }}
                >
                  <View>
                    <Text style={styles.personTxt}>楼盘：</Text>
                  </View>
                  <View style={{ flex: 1, marginTop: -3 }}>
                    <Text style={[styles.personTxtTitle, { lineHeight: 20 }]}>{detailData.gardenName || ''}
                    </Text>
                  </View>
                </View>
                <View style={[styles.personTxtBox, styles.flexRow, { paddingTop: 20, height: 36, alignItems: 'center' }]}>
                  <View>
                    <Text style={[styles.personTxt, { minWidth: 140, width: 140 }]} numberOfLines={1} >客户：<Text style={styles.personTxtTitle}>{detailData.customerName || ''}</Text></Text>
                  </View>
                  <View>
                    <Text style={styles.personTxt}>  电话：{detailData.customerPhone || ''}</Text>
                  </View>
                </View>
                {detailData.appointmentTime ?
                  <View style={{ paddingTop: 20 }}>
                    <Text style={styles.personTxt12}>到访时间：<Text style={[styles.shareText12]}>{detailData.appointmentTime.substring(0, 16)}</Text></Text>
                  </View> : null}
              </View>
              {/* 经纪人信息 */}
              <View style={styles.brokerInfo}>
                <View style={styles.flexRow}>
                  <Icon name="gerenziliao" size={16} color="#e7e8ea" />
                  <Text style={[styles.personTxtTitle, { marginTop: -2 }]}>  {detailData.brokerName || ''}</Text>
                </View>
                <View><Text style={styles.personTxt12}>{detailData.companyName || ''}{detailData.storeName || ' '}</Text></View>
              </View>
            </View>
            {/* 状态 */}
            <View style={styles.personStatus}><Text style={styles.personStatusTxt}>{detailData.statusDesc || ''}</Text></View>
          </View>
          {/* 报备人 */}
          {/* 操作记录 */}
          {
            operationLogs.length > 0 &&
            <View style={{ marginBottom: 10 }}>
              <View style={baseStyles.comTitleOutBox} >
                <View style={baseStyles.comTitleBox}>
                  <Text style={baseStyles.comTitle}>操作记录</Text>
                </View>
              </View>
              <FlatList
                data={operationLogs}
                renderItem={this.renderOperationLogs}
                keyExtractor={(item, index) => index.toString()}
              />
              {/* 列表 */}
            </View >
          }
          {/* 操作记录 */}
          {/* 过期提醒 */}
          {
            (detailData.status === 'WILLOVERDUE' || detailData.status === 'YES') &&
            <View style={{ marginBottom: 10 }}>
              {/* 标题 */}
              <View style={[baseStyles.comTitleOutBox, { marginTop: 0 }]} >
                <View style={baseStyles.comTitleBox}>
                  <Text style={baseStyles.comTitle}>保护期到期时间</Text>
                </View>
              </View>
              {/* 标题 */}
              <View style={[baseStyles.borderTop, styles.list]} >
                <View>
                  {/* <Text style={styles.comImpListTxt}>还有<Text style={baseStyles.comImpColor}>{detailData.willOverdueDay}</Text>天带看过期</Text> */}
                  <Text style={styles.comImpListTxt}>{detailData.willOverdueDay && detailData.willOverdueDay.substring(0, 16)}</Text>
                </View>
                {/* <View>
                  <TouchableOpacity onPress={() => this.openModel(watchDelayStr, 'againGuideConfirm')}>
                    <View style={baseStyles.btnOrange}><Text style={baseStyles.btnOrangeTxt}>重新带看</Text></View>
                  </TouchableOpacity>
                </View> */}
              </View>
            </View>
          }
          {/* 过期提醒 */}
        </ScrollView >
        {/* 底部按钮 */}
        <View style={{ height: 50 }
        }
        >
          <ReportDetailBottom parent={this} bottomParams={bottomParams} status={detailData.status} brokerPhone={detailData.brokerPhone} navigation={navigation} />
        </View >
        <Toast ref="toast" position="center" opacity={0.7} />
        {
          this.state.loading &&
          (
            <View style={baseStyles.overlayLoad} >
              <ActivityIndicator size="large" color="white" style={{ marginTop: -150 }} />
            </View>
          )
        }
        <ShareAlertDialog
          show={this.state.showSharePop}
          parent={this}
          closeModal={(show) => {
            this.setState({ showSharePop: show });
          }}
          {...this.props}
        />

        <DialogBox ref={(dialogbox) => {
          this.dialogbox = dialogbox;
        }}
        />
        {
          explainPopStatus ?
            <View style={styles.explainPopBox} >
              <TouchableOpacity style={styles.explaninCover} onPress={this.onExplainPopState} />
              <View style={styles.explaninInnerBox} >
                <View style={styles.explaninTitle}>
                  <View style={[baseStyles.borderBt, baseStyles.startBetweenRow, { paddingBottom: 15 }]}>
                    <Text style={[baseStyles.text15]}>客户意向</Text>
                    <TouchableOpacity onPress={this.onExplainPopState} style={{ paddingHorizontal: 5, paddingBottom: 5 }}>
                      <Icon name="delete" size={12} color="#CCCCCC" />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ paddingHorizontal: 15 }}>
                  <TextInput
                    style={styles.explaninInput}
                    value={ExplaninText}
                    placeholder="请简要描述下带看的基本信息"
                    onChangeText={this.onChangeText}
                    multiline
                    maxLength={300}
                  />
                  <View style={[baseStyles.startBetweenRow]}>
                    <TouchableOpacity style={[baseStyles.centerContainer, styles.explaninButton, { backgroundColor: '#F5F5F5' }]} onPress={this.onExplainPopState}>
                      <Text style={[baseStyles.colorCcc, baseStyles.text14]}>
                        取消
                      </Text>
                    </TouchableOpacity>
                    {
                      ExplaninText ?
                        <TouchableOpacity
                          style={[baseStyles.centerContainer,
                          styles.explaninButton,
                          { backgroundColor: '#FF9911' }]}
                          onPress={this.onExplainRequest}
                        >
                          <Text style={[baseStyles.white, baseStyles.text14]}>
                            确定
                          </Text>
                        </TouchableOpacity> :
                        <TouchableOpacity
                          style={[baseStyles.centerContainer,
                          styles.explaninButton,
                          { backgroundColor: '#F5F5F5' }]}
                        >
                          <Text style={[baseStyles.colorCcc, baseStyles.text14]}>
                            确定
                          </Text>
                        </TouchableOpacity>
                    }
                    <KeyboardSpacer />
                  </View>
                </View>

              </View>
            </View> : null
        }
      </View >
    );
  }
}


const styles = StyleSheet.create({
  infoItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 15,
    lineHeight: 20,
    alignItems: 'center',
    flexDirection: 'row',
  },
  darkColor: {
    color: '#3a3a3a',
  },
  flexRow: {
    flexDirection: 'row',
  },
  modelBox: {
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  tipIcon: {
    marginRight: 10,
  },
  modelTilteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  modelTilte: {
    fontSize: 16,
    color: '#3a3a3a',
    marginLeft: 10,
  },
  modelTextBox: {
    marginLeft: 30,
    paddingVertical: 4,
  },
  modelText: {
    fontSize: 16,
    color: '#7e7e7e',
  },
  personOuter: {
    paddingHorizontal: 15,
    marginTop: -60,
  },
  personBg: {
    height: 80,
    backgroundColor: '#f91',
  },
  personStatus: {
    position: 'absolute',
    top: 18,
    right: 35,
    backgroundColor: '#fff',
  },
  personStatusTxt: {
    color: '#ffc601',
    fontSize: 16,
  },
  personBox: {
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e7e8ea',
  },
  personInfo: {
    paddingHorizontal: 15,
    paddingVertical: 18,
    flex: 1,
  },
  personTxtBox: {
    paddingTop: 18,
  },
  personTxt: {
    fontSize: 16,
    color: '#a8a8a8',
  },
  personTxt12: {
    fontSize: 12,
    color: '#a8a8a8',
  },
  personTxtTitle: {
    fontSize: 16,
    color: '#3a3a3a',
  },
  brokerInfo: {
    borderColor: '#e7e8ea',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 54,
  },
  list: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    height: 54,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  comImpListTxt: {
    color: '#3a3a3a',
    fontSize: 16,
  },
  comListTxt: {
    color: '#a8a8a8',
    fontSize: 14,
  },
  explainPopBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 99,
    paddingTop: 80,
    width,
    height,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  explaninCover: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  explaninInnerBox: {
    width: 270,
    backgroundColor: '#fff',
    borderRadius: 3,
    paddingVertical: 15,
  },
  explaninTitle: {
    paddingHorizontal: 10,
  },
  explaninInput: {
    fontSize: 13,
    color: '#333',
    height: 180,
    width: 240,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  explaninButton: {
    width: 113,
    height: 35,
    borderRadius: 5,
  },
});

export default ReportDetail;
