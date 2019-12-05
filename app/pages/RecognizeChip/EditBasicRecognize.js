import React from 'react';
import {
  Text,
  View,
  ScrollView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  DeviceEventEmitter,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { toJS } from 'mobx';
import { observer } from 'mobx-react/native';
import Toast from 'react-native-easy-toast';
// 友盟统计
import { UMNative } from '../../common/NativeHelper';
import DialogBox from '../../components/react-native-dialogbox';
import GoBack from '../../components/GoBack';
import Icon from '../../components/Icon/';
import baseStyles from '../../style/BaseStyles';
import RecognizeItem from './RecognizeItem';
import EditBasicReceiptsStore from '../../stores/RecognizeChip/EditBasicRecognize';
import EditReceiptsStore from '../../stores/RecognizeChip/EditReceipt';

// 认筹信息录入基本信息页面
@observer

class EditBasicRecognize extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      title: '认筹信息录入',
      headerRight: (
        <TouchableOpacity onPress={() => params.comfirmRecognition()}>
          <View style={baseStyles.rightBtn}>
            <Text style={{ fontSize: 16 }}>提交</Text>
          </View>
        </TouchableOpacity>
      ),
      headerLeft: (<GoBack
        navigation={navigation}
        onBackPress={() => params.navigateBack && params.navigateBack()}
      />),
    };
  };

  // static propTypes = {
  //   navigation: PropTypes.object,
  //   data: PropTypes.arrayOf(PropTypes.number),
  // }

  // static defaultProps = {
  //   navigation: null,
  //   data: [],
  // }
  constructor(props) {
    super(props);
    this.incomeList = [];
    this.showReport = this.showReport.bind(this);
    this.state = {
      store: false,
    };
  }
  componentDidMount () {
    // 统计页面时长
    UMNative.onPageBegin('BASIC_RECOGNIZE');
    this.sumbitFlag = true;
    this.loading = false;
    this.props.navigation.setParams({
      comfirmRecognition: this.comfirmRecognition.bind(this),
      navigateBack: this.navigateBack.bind(this),
    });
    // 获取客户来源和成交确认人
    this.listener = DeviceEventEmitter.addListener('BasicReceiptsSelect', (item) => {
      this.basicReceiptsStore.changeSelectItem(item);
    });

    const { params = {} } = this.props.navigation.state;
    this.incomeBillsListener = DeviceEventEmitter.addListener('IncomeBillsListener', (data) => {
      this.basicReceiptsStore.getReceipts(data.incomeBillsData);
    });
  }

  componentWillUnmount () {
    // 统计页面时长
    UMNative.onPageEnd('BASIC_RECOGNIZE');
    this.listener.remove();
    this.incomeBillsListener.remove();
  }

  receiptsStore = new EditReceiptsStore();
  basicReceiptsStore = new EditBasicReceiptsStore();

  comfirmRecognition () {
    if (!this.sumbitFlag) {
      return;
    }
    const navigation = this.props.navigation;
    const { goBack } = navigation;
    const { params = {} } = navigation.state;
    const bottomParams = params.bottomParams || {};
    // 获取基础分销信息
    const baseInfo = this.basicReceiptsStore;
    const toast = this.refs.toast;
    const sendParams = {
      // recognitionId:recognitionId
      reservationId: bottomParams.reservationId,
      dealConfirmUserErpId: baseInfo.dealConfirmUserErpId,
      customerName: bottomParams.dealCustomerName,
      customerSource: baseInfo.customerSourceId,
    };
    if (!baseInfo.dealConfirmUserErpId) {
      toast.show('请选择成交确认人!');
      return;
    }
    if (!baseInfo.customerSourceId) {
      toast.show('请选择客户来源!');
      return;
    }
    // 获取认筹信息列表
    sendParams.incomeBills = this.basicReceiptsStore.getFormData();
    if (!sendParams.incomeBills.length) {
      toast.show('请录入认筹分销款!');
      return;
    }
    this.sumbitFlag = false;
    this.basicReceiptsStore.setLoading();
    // 统计提交按钮点击数
    UMNative.onEvent('SUBMIT_RECOGNIZE_COUNT');
    axios.post('recognition/add', sendParams).then((res) => {
      if (res.data.status === 'C0000') {
        this.basicReceiptsStore.cancelLoading();
        this.showReport();
      } else {
        this.sumbitFlag = true;
        this.basicReceiptsStore.cancelLoading();
        toast.show(`认筹添加失败, ${res.data.message}`);
      }
    }).catch(() => {
      this.sumbitFlag = true;
      this.basicReceiptsStore.cancelLoading();
      toast.show('服务器异常');
    });
  }

  navigateBack () {
    this.dialogbox.confirm({
      title: null,
      content: (
        <View style={styles.modelBox}>
          <View style={styles.modelTilteBox}>
            <Icon name="jingshi" size={20} color="#ffc601" style={{ width: 34 }} />
            <Text style={styles.modelTilte}>确定要退出吗？</Text>
          </View>
          <View style={styles.modelTextBox}>
            <Text style={styles.modelText}>
              您填写的内容将不会保存！
            </Text>
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
          // 统计确认返回按钮点击数
          UMNative.onEvent('BACK_RECOGNIZE_COUNT');
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

  showReport () {
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
          this.refs.toast.show('认筹添加成功！');
          setTimeout(() => {
            this.props.navigation.goBack();
          }, 1500);
        },
      },
    });
  }

  renderItem (data) {
    return (
      <RecognizeItem navigation={this.props.navigation} data={data} expandId={this.expandId} />
    );
  }
  render () {
    const navigation = this.props.navigation;
    const { params = {} } = navigation.state;
    const bottomParams = params.bottomParams || {};
    this.expandId = bottomParams.expandId;
    return (
      <View>
        <ScrollView>
          {/* 基础分销信息 */}
          {/* 标题 */}
          <View style={baseStyles.comTitleOutBox} >
            <View style={baseStyles.comTitleBox}>
              <Text style={baseStyles.comTitle}>基础分销信息
              </Text>
            </View>
          </View >
          {/* 标题 */}
          {/* 信息项 */}
          <View style={[baseStyles.borderTop, styles.list]}>
            <View>
              <Text style={styles.comLeftTxt}>报备客户：</Text>
            </View>
            <View>
              <Text style={styles.comRightTxt}>{bottomParams.dealCustomerName}</Text>
            </View>
          </View>
          {/* 信息项 */}
          {/* 信息项 */}
          <View style={[baseStyles.borderTop, styles.list]}>
            <View>
              <Text style={styles.comLeftTxt}>项目负责人：</Text>
            </View>
            <View>
              <Text style={styles.comRightTxt}>{bottomParams.projectManagerName}</Text>
            </View>
          </View>
          {/* 信息项 */}
          {/* 信息项成交确认人 */}
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('SelectPicker', {
                title: '成交确认人',
                url: '/common/projectPersons',
                type: 'dealConfirmUserErp',
                event: 'BasicReceiptsSelect',
                selected: this.basicReceiptsStore.dealConfirmUserErpId,
                params: { expandId: bottomParams.expandId },
              });
            }}
          >
            <View style={[baseStyles.borderTop, styles.formItem]}>
              <Text style={styles.paramTxt}>成交确认人：</Text>
              {/* <TextInput
                style={styles.formInput}
                placeholder="请选择"
                placeholderTextColor="#a8a8a8"
                underlineColorAndroid="transparent"
                editable={false}
                defaultValue={this.basicReceiptsStore.dealConfirmUserErpName}
              /> */}
              <View style={styles.selectBox}>
                {this.basicReceiptsStore.dealConfirmUserErpName ?
                  <Text style={styles.selectText}>
                    {this.basicReceiptsStore.dealConfirmUserErpName}
                  </Text>
                  :
                  <Text style={[styles.selectText, styles.ca8]}>请选择</Text>
                }
              </View>
              <View style={styles.rightIcon} ><Icon name="arrow-right" size={16} color="#3a3a3a" /></View>
            </View>
          </TouchableOpacity>
          {/* 信息项 */}
          {/* 信息项 客户来源 */}
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('SelectPicker', {
                title: '客户来源',
                url: '/common/customerSources',
                type: 'customerSource',
                selected: this.basicReceiptsStore.customerSourceId,
                event: 'BasicReceiptsSelect',
              });
            }}
          >
            <View style={[baseStyles.borderTop, styles.formItem]}>
              <Text style={styles.paramTxt}>客户来源：</Text>
              <View style={styles.selectBox}>
                {this.basicReceiptsStore.customerSourceName ?
                  <Text style={styles.selectText}>
                    {this.basicReceiptsStore.customerSourceName}
                  </Text>
                  :
                  <Text style={[styles.selectText, styles.ca8]}>请选择</Text>
                }
              </View>
              <View style={styles.rightIcon} ><Icon name="arrow-right" size={16} color="#3a3a3a" /></View>
            </View>
          </TouchableOpacity>
          {/* 信息项 */}
          {/* 基础分销信息 */}
          {/* 标题 */}
          <View style={baseStyles.comTitleOutBox} >
            <View style={[baseStyles.comTitleBox, {
              justifyContent: 'space-between',
              flex: 1,
            }]}
            >
              <View><Text style={baseStyles.comTitle}>新增认筹收款</Text></View>
              <TouchableOpacity onPress={() => navigation.navigate('EditReceipts', { expandId: bottomParams.expandId })}>
                <View style={[baseStyles.btnOrange, {
                  backgroundColor: '#f91',
                  borderWidth: 0,
                }]}
                ><Text style={[baseStyles.btnOrangeTxt, { color: '#fff' }]}>新增</Text></View>
              </TouchableOpacity>
            </View>
          </View >
          {/* 标题 */}
          {/* 认筹信息列表 */}
          {this.basicReceiptsStore.list.length > 0 &&
            <FlatList
              initialListSize={4}
              data={toJS(this.basicReceiptsStore.list)}
              renderItem={this.renderItem.bind(this)}
              keyExtractor={(item, index) => index.toString()}
            />}
        </ScrollView>
        <Toast ref="toast" position="center" opacity={0.7} />
        {
          this.basicReceiptsStore.loading &&
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
  selectBox: {
    padding: 0,
    margin: 0,
    flex: 1,
    flexDirection: 'row',
    // color: '#3a3a3a',
    height: '100%',
    alignItems: 'center',
    // textAlign: 'right',
  },
  selectText: {
    flex: 1,
    fontSize: 16,
    textAlign: 'right',
  },
  ca8: {
    color: '#a8a8a8',
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
});

export default EditBasicRecognize;
