import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  InteractionManager,
  DeviceEventEmitter,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import Toast from 'react-native-easy-toast';
// 友盟统计
import { UMNative } from '../../common/NativeHelper';
import GoBack from '../../components/GoBack';
import Icon from '../../components/Icon/';
import baseStyles from '../../style/BaseStyles';
import SubscribeStore from '../../stores/SubscribeDetail/SubscribeDetail';
import ContractStore from '../../stores/Common/Contract';
import DistributinSotre from '../../stores/Common/Distributin';
import GroupPurchaseStore from '../../stores/Common/GroupPurchase';
import ContractView from '../Common/ContractView';
import DistributinView from '../Common/DistributionView';
import GroupPurchaseView from '../Common/GroupPurchaseView';
// 成交详情页面

class DealDetail extends PureComponent {
  static propTypes = {
    navigation: PropTypes.object,
  };

  static defaultProps = {
    navigation: {},
  };
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      title: '成交详情',
      headerLeft: <GoBack navigation={navigation} />,
      headerRight: params.headRightContent || <Text />,
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      subscribeDetailData: {},
      loading: true,
    };
  }
  componentDidMount() {
    // 统计页面时长
    UMNative.onPageBegin('SUBSCRIBE_DETAIL');
    InteractionManager.runAfterInteractions(this.requestData.bind(this));
    this.subRefresh = DeviceEventEmitter.addListener(
      'DealDetailsRefresh',
      this.requestData.bind(this),
    );
  }

  componentWillUnmount() {
    // 统计页面时长
    UMNative.onPageEnd('SUBSCRIBE_DETAIL');
    // 移除
    this.subRefresh.remove();
  }

  requestData() {
    const { params = {} } = this.props.navigation.state;
    const navigation = this.props.navigation;
    const subscribeId = params.subscribeId;
    axios
      .get('subscribe/detail', { params: { subscribeId } })
      .then((res) => {
        this.setState({
          loading: false,
        });
        if (res.data.status !== 'C0000') {
          this.refs.toast.show('请求失败!');
          return;
        }
        const result = res.data.result;
        // 暂时处理多个人员不给看详情的处理 canEdit为false进入
        // if (
        //   (result.distributionCommission &&
        //     !result.distributionCommission.canEdit) ||
        //   (result.groupCommission && !result.groupCommission.canEdit)
        // ) {
        //   this.refs.toast.show('暂不支持多名分销人员，编辑请到电脑版!', 1000);
        //   setTimeout(() => {
        //     navigation.goBack();
        //   }, 1500);
        //   return;
        // }
        this.auditStatusDesc = result.auditStatusDesc;
        this.dealStatusDesc = result.dealStatusDesc;
        // 根据状态判断是否可以编辑
        this.isEdit();
        this.setState({
          subscribeDetailData: result,
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
        });
        this.refs.toast.show('服务器异常');
      });
  }

  isEdit() {
    const status = this.auditStatusDesc || '';
    const isCancel = !!(
      this.dealStatusDesc === '撤销' ||
      this.dealStatusDesc === '撤单' ||
      this.dealStatusDesc === '撤单中'
    );
    let enEdit = false;
    if (status === '财务审核完成' || status === '' || isCancel) {
      enEdit = false;
    } else {
      enEdit = true;
      this.props.navigation.setParams({
        headRightContent: (
          <TouchableOpacity
            onPress={() => this.props.navigation.state.params.goEdit()}
          >
            <View style={baseStyles.rightBtn}>
              <Text style={{ fontSize: 16 }}>编辑</Text>
            </View>
          </TouchableOpacity>
        ),
        goEdit: this.goEdit.bind(this),
      });
    }
  }

  // 根据 团购分佣信息中的分销信息,'无'去上数页面SubscribeDetail， '有'去转成交页面DealChange
  goEdit() {
    // 统计修改按钮点击数
    UMNative.onEvent('EDIT_SUBSCRIBE_COUNT');
    const navigation = this.props.navigation;
    const detailData = this.state.subscribeDetailData;

    const pageName = detailData.groupCommission
      ? 'DealChange'
      : 'SubscribeDetail';

    const bigParams = {
      subscribeStore: new SubscribeStore({
        projectManagerId: detailData.projectManagerId,
        projectManagerName: detailData.projectManagerName,
        dealConfirmUserId: detailData.dealConfirmUserErpId,
        dealConfirmUserName: detailData.dealConfirmUserName,
        customerSourceId: detailData.customerSource,
        customerSource: detailData.customerSourceDesc,
        sourceType: detailData.sourceType,
      }),
      contractStore: this.contractStore,
      distributinStore: this.distributinStore,
      groupPurchaseStore: this.groupPurchaseStore,
      bottomParams: {
        expandId: detailData.expandId,
        reservationId: detailData.reservationId,
        recognitionId: detailData.recognitionId,
        reservationCustomerName: detailData.reservationCustomerName,
        projectManagerName: detailData.projectManagerName,
        dealCustomerName: detailData.dealCustomerName,
        operateType: 'UPDATE',
        subscribeId: detailData.subscribeId,
        incomeInfoId: detailData.incomeInfoId,
        settleInfoId: detailData.settleInfoId,
        filingId: detailData.filingId,
        contractId: detailData.contractId,
        dealNumber: detailData.dealNumber,
        customerSource: detailData.customerSource,
        contractNumber: detailData.contractNumber,
        roomRecordId: detailData.roomRecordId,
        reservationCustomerRecordId: detailData.reservationCustomerRecordId,
        gardenName: detailData.dealGardenName,
      },
    };
    // 参数
    if (detailData && detailData.distributionCommission) {
      bigParams.bottomParams.distributionPersonId =
        detailData.distributionCommission.distributionPersonId;
      bigParams.bottomParams.distributionPersonName =
        detailData.distributionCommission.distributionPersonName;
    }

    navigation.navigate(pageName, bigParams);
  }

  // 成交状态显示颜色
  statusView(status) {
    let statusColor = '#ff1515';
    if (status === '财务审核完成' || status === '已结算') {
      statusColor = '#4ed5a4';
    }
    return (
      <View
        style={[
          baseStyles.btnOrange,
          styles.statusBtn,
          { borderColor: statusColor },
        ]}
      >
        <Text style={[baseStyles.btnOrangeTxt, { color: statusColor }]}>
          {status}
        </Text>
      </View>
    );
  }

  // 楼盘信息
  gardernJSX(detailData) {
    return (
      <View>
        <View style={[styles.list, styles.pr0, { marginTop: 10 }]}>
          <View>
            <Text style={styles.titleTxt}>楼盘信息</Text>
          </View>
        </View>
        <View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text
                style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}
              >
                签约主体：
              </Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>
                {detailData.subjectBody || ''}
              </Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text
                style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}
              >
                结算主体：
              </Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>
                {detailData.settlementSubject || ''}
              </Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text
                style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}
              >
                楼盘登记名：
              </Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>
                {detailData.registerName || ''}
              </Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text
                style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}
              >
                楼盘推广名：
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.comRightTxt,
                  baseStyles.text14,
                  { lineHeight: 16 },
                ]}
              >
                {detailData.extendName || ''}
              </Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text
                style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}
              >
                开发商名称：
              </Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>
                {detailData.developerName || ''}
              </Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text
                style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}
              >
                楼盘地址：
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.comRightTxt,
                  baseStyles.text14,
                  { lineHeight: 16 },
                ]}
              >
                {detailData.gardenAddress || ''}
              </Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text
                style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}
              >
                项目编号：
              </Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>
                {detailData.gardenNumber || ''}
              </Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text
                style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}
              >
                合同编号：
              </Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>
                {detailData.contractNumber || ''}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // 分销信息
  distributionJsx(detailData) {
    return (
      <View>
        <View style={[styles.list, styles.pr0, { marginTop: 10 }]}>
          <View>
            <Text style={styles.titleTxt}>分销信息</Text>
          </View>
        </View>
        {/* 标题 */}
        {/* 内容 */}
        <View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text
                style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}
              >
                成交确认人：
              </Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>
                {detailData.dealConfirmUserName || ''}
              </Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text
                style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}
              >
                客户来源：
              </Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>
                {detailData.customerSourceDesc || ''}
              </Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text
                style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}
              >
                报备客户：
              </Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>
                {detailData.reservationCustomerName || ''}
              </Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text
                style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}
              >
                项目负责人：
              </Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>
                {detailData.projectManagerName || ''}
              </Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text
                style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}
              >
                报备经纪人：
              </Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>
                {detailData.reservationBrokerName || ''}
              </Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text
                style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}
              >
                经纪人公司：
              </Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>
                {detailData.brokerCompanyName || ''}
              </Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text
                style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}
              >
                分销商标号：
              </Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>
                {detailData.distributionTradeMark || ''}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
  // 合同信息
  contractJsx(detailData) {
    const data = {
      expandId: detailData.expandId,
      reservationId: detailData.reservationId,
      dealCustomerId: detailData.dealCustomerId,
      dealCustomerName: detailData.dealCustomerName,
      dealCustomerPhone: detailData.customerPhone,
      payTypeId: detailData.payType,
      payTypeValue: detailData.payTypeDesc,
      buyDate: detailData.buyDate,
      roomId: detailData.roomId,
      roomNumber: detailData.roomNumber,
      roomDesc: detailData.roomNumber,
      area: detailData.area,
      totalPrice: detailData.totalPrice,
      createDate: detailData.createDate, // 签约日期
      isShow: true,
    };
    this.contractStore = new ContractStore(data);

    return (
      <View>
        <View style={[styles.list, styles.pr0, { marginTop: 10 }]}>
          <View>
            <Text style={styles.titleTxt}>合同信息</Text>
          </View>
        </View>
        {ContractView(this.contractStore)}
      </View>
    );
  }

  // 分销款分佣信息
  distributionCommissionJsx() {
    const sendData = this.state.subscribeDetailData;
    sendData.distributionCommission.totalPrice = sendData.totalPrice;
    sendData.distributionCommission.infoVisable = true;
    this.distributinStore = new DistributinSotre(
      sendData.distributionCommission,
    );
    return (
      <View style={{ marginTop: 10 }}>
        {/* 标题 */}
        <View style={[styles.list, styles.pr0, baseStyles.borderBt]}>
          <View>
            <Text style={styles.titleTxt}>分销款分佣信息</Text>
          </View>
        </View>
        {DistributinView(this.distributinStore)}
      </View>
    );
  }

  // 团购费分佣信息
  groupCommissionJsx() {
    const sendData = this.state.subscribeDetailData;
    sendData.groupCommission.infoVisable = true;
    this.groupPurchaseStore = new GroupPurchaseStore(sendData.groupCommission);
    return (
      <View style={{ marginTop: 10 }}>
        {/* 标题 */}
        <View style={[styles.list, styles.pr0, baseStyles.borderBt]}>
          <View>
            <Text style={styles.titleTxt}>团购费分佣信息</Text>
          </View>
        </View>
        {GroupPurchaseView(this.groupPurchaseStore)}
      </View>
    );
  }

  render() {
    // 除财务审核完成 其他都状态都能编辑
    const detailData = this.state.subscribeDetailData;
    const isCancel = !!(
      detailData.dealStatusDesc === '撤销' ||
      detailData.dealStatusDesc === '撤单' ||
      detailData.dealStatusDesc === '撤单中'
    );
    return (
      <ScrollView>
        {/* 客户基础信息 */}
        {/* 标题 */}
        <View style={baseStyles.comTitleOutBox}>
          <View
            style={[
              baseStyles.comTitleBox,
              {
                justifyContent: 'space-between',
                flex: 1,
              },
            ]}
          >
            <View>
              <Text style={baseStyles.comTitle}>客户基础信息</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              {detailData.auditStatusDesc &&
                this.statusView(detailData.auditStatusDesc)}
              {detailData.settleStatusDesc &&
                detailData.dealStatusDesc &&
                isCancel
                ? this.statusView(detailData.dealStatusDesc)
                : this.statusView(detailData.settleStatusDesc)}
            </View>
          </View>
        </View>
        {/* 标题 */}
        <View style={[baseStyles.borderTop, styles.infoItem]}>
          <View>
            <Text
              style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}
            >
              客户名称：
            </Text>
          </View>
          <View>
            <Text style={[styles.comRightTxt, baseStyles.text14]}>
              {detailData.dealCustomerName || ''}
            </Text>
          </View>
        </View>
        <View style={[baseStyles.borderTop, styles.infoItem]}>
          <View>
            <Text
              style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}
            >
              成交楼盘名：
            </Text>
          </View>
          <View>
            <Text style={[styles.comRightTxt, baseStyles.text14]}>
              {detailData.dealGardenName || ''}
            </Text>
          </View>
        </View>
        <View style={[baseStyles.borderTop, styles.infoItem]}>
          <View>
            <Text
              style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}
            >
              成交编号：
            </Text>
          </View>
          <View>
            <Text style={[styles.comRightTxt, baseStyles.text14]}>
              {detailData.dealNumber || ''}
            </Text>
          </View>
        </View>
        <View style={[baseStyles.borderTop, styles.infoItem]}>
          <View>
            <Text
              style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}
            >
              报备编号：
            </Text>
          </View>
          <View>
            <Text style={[styles.comRightTxt, baseStyles.text14]}>
              {detailData.reservationNumber || ''}
            </Text>
          </View>
        </View>
        <View style={[baseStyles.borderTop, styles.infoItem]}>
          <View>
            <Text
              style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}
            >
              上数日期：
            </Text>
          </View>
          <View>
            <Text style={[styles.comRightTxt, baseStyles.text14]}>
              {(detailData.buyDate && detailData.buyDate.substring(0, 10)) ||
                ''}
            </Text>
          </View>
        </View>
        {/* 客户基础信息 */}
        {/* 楼盘信息 */}
        {this.gardernJSX(detailData)}
        {/* 分销信息 */}
        {this.distributionJsx(detailData)}
        {/* 合同信息 */}
        {this.contractJsx(detailData)}
        {/* 分销款分佣信息 */}
        {detailData.distributionCommission && this.distributionCommissionJsx()}
        {/* 团购费分佣信息 */}
        {detailData.groupCommission && this.groupCommissionJsx()}
        <Toast ref="toast" position="center" opacity={0.7} />
        {this.state.loading && (
          <View style={baseStyles.overlayLoad}>
            <ActivityIndicator
              size="large"
              color="white"
              style={{ marginTop: -150 }}
            />
          </View>
        )}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  statusBtn: {
    paddingHorizontal: 5,
    borderRadius: 5,
    marginLeft: 10,
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
  pr0: {
    paddingRight: 0,
  },
  rightIcon: {
    paddingRight: 15,
    paddingLeft: 5,
  },
  infoItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 15,
    // lineHeight: 20,
    alignItems: 'center',
    flexDirection: 'row',
  },
  leftWidth: {
    width: 105,
  },
  rightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    paddingLeft: 15,
  },
  comLeftTxt: {
    color: '#7e7e7e',
    fontSize: 14,
  },
  comRightTxt: {
    color: '#3a3a3a',
    fontSize: 14,
  },
  modelBox: {
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  tipIcon: {
    width: 34,
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
});

export default DealDetail;
