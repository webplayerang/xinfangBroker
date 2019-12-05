import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  View,
  StyleSheet,
  InteractionManager,
  FlatList,
  ScrollView,
  DeviceEventEmitter,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import Toast from 'react-native-easy-toast';
// 友盟统计
import { UMNative } from '../../common/NativeHelper';
import DialogBox from '../../components/react-native-dialogbox';
import Icon from '../../components/Icon/';
import GoBack from '../../components/GoBack';
import baseStyles from '../../style/BaseStyles';
import RecognizeItem from '../RecognizeChip/RecognizeItem';
import RecoginzeDetailBottom from './RecoginzeDetailBottom';

// 认筹详情页面

class RecoginzeDetail extends PureComponent {
  // static propTypes = {
  //   navigation: PropTypes.object,
  // }

  // static defaultProps = {
  //   navigation: {},
  // }
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      title: '认筹详情',
      headerLeft: (<GoBack navigation={navigation} />),
      headerRight: (<Text />),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      recoginzeDetailData: {},
    };
  }

  componentDidMount () {
    // 统计页面时长
    UMNative.onPageBegin('RECOGNIZE_DETAIL');
    InteractionManager.runAfterInteractions(this.requestData.bind(this));
    // 修改资料后重新刷新客户信息
    this.subRefresh = DeviceEventEmitter.addListener('RecognitionDetailsRefresh', this.requestData.bind(this));
  }
  componentWillUnmount () {
    // 统计页面时长
    UMNative.onPageEnd('RECOGNIZE_DETAIL');
    // 移除
    this.subRefresh.remove();
  }
  requestData () {
    const { params = {} } = this.props.navigation.state;
    const recognitionId = params.recognitionId;
    this.recognitionId = recognitionId;
    axios.get('recognition/detail', { params: { recognitionId } })
      .then((res) => {
        this.setState({
          loading: false,
        });
        if (res.data.status !== 'C0000') {
          this.refs.toast.show('请求失败!');
          return;
        }
        const result = res.data.result;
        this.reservationId = result.reservationId;
        this.setState({
          recoginzeDetailData: result,
        });
      }).catch(() => {
        this.setState({
          loading: false,
        });
        this.refs.toast.show('服务器异常');
      });
  }
  // 认筹款收齐
  openModel () {
    this.dialogbox.confirm({
      title: null,
      content: <View style={styles.modelBox}>
        <View style={styles.modelTilteBox}>
          <Icon name="jingshi" size={20} color="#ffc601" style={{ width: 34 }} />
          <Text style={styles.modelTilte}>确定认筹款已经收齐了吗？</Text>
        </View>
      </View>,
      ok: {
        text: '确定',
        style: {
          color: '#ffa200',
          fontSize: 18,
        },
        callback: () => {
          axios.get('/recognition/collectConfirm', { params: { recognitionId: this.recognitionId } })
            .then((res1) => {
              // 接口成功失败后关闭窗口
              this.dialogbox.close();
              DeviceEventEmitter.emit('RecognizeManageList');
              if (res1.data.status !== 'C0000') {
                return;
              }
              // 接口成功后关闭窗口刷新认筹详情页
              this.requestData();
            });
        },
      },
      cancel: {
        text: '取消',
        style: {
          color: '#3a3a3a',
          fontSize: 18,
        },
        // style: baseStyles.cancel,
      },
    });
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
  // 特改认筹款 转成交验证
  openTip (text) {
    this.refs.toast.show(text);
  }
  // 已收齐状态显示颜色
  statusView (status) {
    let statusColor = '#ff1515';
    if (status === '已收齐' || status === '已上数' || status === '已认筹') {
      statusColor = '#4ed5a4';
    }
    return (
      <View style={[baseStyles.btnOrange, styles.statusBtn, { borderColor: statusColor }]}>
        <Text style={[baseStyles.btnOrangeTxt, { color: statusColor }]}>{status}</Text>
      </View >
    );
  }
  // 楼盘信息
  gardernJSX (detailData) {
    return (
      <View >
        <View style={[styles.list, styles.pr0, { marginTop: 10 }]} >
          <View><Text style={styles.titleTxt}>楼盘信息</Text></View>
        </View>
        <View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>签约主体：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{detailData.subjectBody || ''}</Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>结算主体：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{detailData.settlementSubject || ''}</Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>楼盘登记名：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{detailData.registerName || ''}</Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>楼盘推广名：</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.comRightTxt, baseStyles.text14, { lineHeight: 16 }]}>{detailData.extendName || ''}</Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>开发商名称：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{detailData.developerName || ''}</Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>楼盘地址：</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.comRightTxt, baseStyles.text14, { lineHeight: 16 }]}>{detailData.gardenAddress || ''}</Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>项目编号：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{detailData.gardenNumber || ''}</Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>合同编号：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{detailData.contractNumber || ''}</Text>
            </View>
          </View>
        </View>
      </View >
    );
  }
  // 分销信息
  distributionJsx (detailData) {
    return (
      <View>
        <View style={[styles.list, styles.pr0, { marginTop: 10 }]} >
          <View><Text style={styles.titleTxt}>分销信息</Text></View>
        </View>
        {/* 标题 */}
        {/* 内容 */}
        <View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>成交确认人：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{detailData.dealConfirmUserName || ''}</Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>客户来源：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{detailData.customerSourceDesc || ''}</Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>报备客户：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{detailData.reservationCustomerName || ''}</Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>项目负责人：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{detailData.projectManagerName || ''}</Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>报备经纪人：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{detailData.reservationBrokerName || ''}</Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>经纪人公司：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{detailData.brokerCompanyName || ''}</Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>分销商标号：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{detailData.distributionTradeMark || ''}</Text>
            </View>
          </View>
        </View>
      </View>);
  }

  renderItem (data) {
    const detailData = this.state.recoginzeDetailData;
    const editNeed = {
      customerName: detailData.reservationCustomerName,
      customerSource: detailData.customerSource,
      dealConfirmUserErpId: detailData.dealConfirmUserErpId,
      recognitionId: detailData.recognitionId,
      reservationId: detailData.reservationId,
      incomeBills: detailData.incomeBillList,
      type: 'edit',
    };
    return (
      <RecognizeItem
        navigation={this.props.navigation}
        data={data}
        editNeed={editNeed}
        expandId={detailData.expandId}
      />
    );
  }

  render () {
    const navigation = this.props.navigation;
    const detailData = this.state.recoginzeDetailData;
    const bottomParams = {
      depositStatus: detailData.depositStatusDesc,
      transactionStatus: detailData.transactionStatusDesc,
      reservationId: detailData.reservationId,
      expandId: detailData.expandId,
      recognitionId: detailData.recognitionId,
      projectManagerName: detailData.projectManagerName,
      dealConfirmUserErpId: detailData.dealConfirmUserErpId,
      dealConfirmUserName: detailData.dealConfirmUserName,
      reservationCustomerName: detailData.reservationCustomerName,
      brokerPhone: detailData.reservationBrokerPhone,
      dealCustomerName: detailData.reservationCustomerName,
      dealCustomerPhone: detailData.reservationBrokerPhone,
      distributionPersonId: detailData.reservationBrokerEmpId,
      distributionPersonName: detailData.reservationBrokerName,
      gardenName: detailData.registerName,
    };
    return (
      <View style={[baseStyles.container, { justifyContent: 'space-between', flex: 1 }]}>
        <ScrollView>
          {/* 客户基础信息 */}
          {/* 标题 */}
          <View style={baseStyles.comTitleOutBox} >
            <View style={[baseStyles.comTitleBox, {
              justifyContent: 'space-between',
              flex: 1,
            }]}
            >
              <View><Text style={baseStyles.comTitle}>客户基础信息</Text></View>
              <View style={{ flexDirection: 'row' }}>
                {detailData.depositStatusDesc && this.statusView(detailData.depositStatusDesc)}
                {detailData.transactionStatusDesc && this.statusView(detailData.transactionStatusDesc)}
              </View>
            </View>
          </View >
          {/* 标题 */}
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>客户名称：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{detailData.reservationCustomerName || ''}</Text>
            </View>
          </View>

          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>成交楼盘名：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{detailData.dealGardenName || ''}</Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>认筹编号：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{detailData.recognitionNumber || ''}</Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>报备编号：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{detailData.reservationNumber || ''}</Text>
            </View>
          </View>
          {/* 客户基础信息 */}
          {/* 楼盘信息 */}
          {this.gardernJSX(detailData)}
          {/* 分信息 */}
          {this.distributionJsx(detailData)}
          {/* 认筹信息 */}
          {/* 认筹信息列表 */}
          <FlatList
            style={{ marginBottom: 10 }}
            initialListSize={4}
            data={detailData.incomeBillList}
            renderItem={this.renderItem.bind(this)}
            keyExtractor={(item, index) => index.toString()}
          />
        </ScrollView>
        {/* 底部按钮 */}
        <View style={{ height: 50 }}>
          <RecoginzeDetailBottom navigation={navigation} parent={this} bottomParams={bottomParams} />
        </View>
        <Toast ref="toast" position="center" opacity={0.7} />
        {this.state.loading &&
          (
            <View style={baseStyles.overlayLoad} >
              <ActivityIndicator size="large" color="white" style={{ marginTop: -150 }} />
            </View>
          )
        }
        <DialogBox ref={(dialogbox) => { this.dialogbox = dialogbox; }} />
      </View >
    );
  }
}


const styles = StyleSheet.create({
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
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 15,
    // lineHeight: 20,
  },
  leftWidth: {
    width: 88,
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

});

export default RecoginzeDetail;
