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
import axios from 'axios';
import Toast from 'react-native-easy-toast';
// 友盟统计
import axiosErp from '../../common/AxiosInstance';
import BaseInfo from '../../common/BaseInfo';

import DialogBox from '../../components/react-native-dialogbox';
import Icon from '../../components/Icon/';
import GoBack from '../../components/GoBack';

import BaseStyles from '../../style/BaseStyles';

// 认筹详情页面

export default class InvoiceAuditDetail extends PureComponent {
  // static propTypes = {
  //   navigation: PropTypes.object,
  // }

  // static defaultProps = {
  //   navigation: {},
  // }
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      title: '开票详情',
      headerLeft: (<GoBack navigation={navigation} />),
      headerRight: (<Text />),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      invoiceBillData: {},
    };
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(this.requestData.bind(this));
  }
  componentWillUnmount() {

  }

  requestData() {
    const { id } = this.props.navigation.state.params; // 开票单据id

    axiosErp.instance.get('appInvoiceBill/getInvoiceBill', { params: { id } })
      .then((res) => {
        this.setState({
          loading: false,
          invoiceBillData: res.data.invoiceBill,
        });
      }).catch(() => {
        this.setState({
          loading: false,
        });
        this.toast.show('服务器异常');
      });
  }

  // 确认弹出框
  alertConfirm(type) {
    this.dialogbox.confirm({
      title: null,
      content: (
        <View style={styles.modelBox}>
          <Icon name="jingshi" size={20} color="#ffc601" style={{ width: 34 }} />
          <Text style={[BaseStyles.text16, BaseStyles.black]}>确认审批通过吗？</Text>
        </View>),
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
          this.dialogbox.close();
          this.doAudit(type);
        },
      },
    });
  }

  doAudit(status) {
    const resultStr = status === 'AGREE' ? '审批成功' : '驳回成功';
    const { id, workflowBillId, workflowBillAuditstatus } = this.props.navigation.state.params; // 开票单据id

    axiosErp.instance.get('appInvoiceBill/doAudit',
      {
        params: {
          id: workflowBillId, // 审批流程id
          targetId: id, // 开票单据id
          status, // 审核结果(通过，传”AGREE”； 驳回，传”DISAGREE”)
          auditStatus: workflowBillAuditstatus, // 审批流程审批状态
        },
      })
      .then((res) => {
        if (res.data.success) {
          this.toast.show(resultStr);
          this.props.navigation.goBack();
          DeviceEventEmitter.emit('InvoiceAuditList');
          DeviceEventEmitter.emit('ProjectApprovalIndex');
          DeviceEventEmitter.emit('ProjectApproval');
        } else {
          this.toast.show(resultStr);
        }
      }).catch(() => {
        this.toast.show(resultStr);
      });
  }

  // 跳转路由 公共方法
  navigateTo(route, params = {}) {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }


  render() {
    const { invoiceBillData } = this.state;
    if (Object.keys(invoiceBillData).length === 0) {
      return null;
    }

    return (
      <View style={BaseStyles.container}>
        <ScrollView style={[styles.container, { marginBottom: BaseInfo.erpPermission.invoiceBillBizAudit ? 45 : 0 }]}>
          <View style={styles.commonHeader}>
            <View style={styles.leftYellow}>
              <Text style={styles.commonTitle}>{invoiceBillData.project.garden.name}</Text>
            </View>
          </View>

          <View style={styles.main}>
            <View style={styles.mainItem}>
              <Text style={styles.mainLabel}>分公司：</Text>
              <Text style={styles.mainContent}>{invoiceBillData.project.company.name}</Text>
            </View>

            <View style={styles.mainItem}>
              <Text style={styles.mainLabel}>开票主体：</Text>
              <Text style={styles.mainContent}>
                {invoiceBillData.subjectDesc}
              </Text>
            </View>

            <View style={styles.mainItem}>
              <Text style={styles.mainLabel}>款项类型：</Text>
              <Text style={styles.mainContent}>
                {invoiceBillData.dataTypeAlias1}
              </Text>
            </View>

            {invoiceBillData.dataType === 'GROUPON' ? null
              : (
                <View style={styles.mainItem}>
                  <Text style={styles.mainLabel}>开票公司：</Text>
                  <Text style={styles.mainContent}>
                    {invoiceBillData.title.companyInfo ?
                      invoiceBillData.title.companyInfo.name
                      : '未知'
                    }
                  </Text>
                </View>
              )
            }

            {invoiceBillData.dataType === 'GROUPON' ? null : (
              <View style={styles.mainItem}>
                <Text style={styles.mainLabel}>纳税识别号：</Text>
                <Text style={styles.mainContent}>
                  {invoiceBillData.title.identification}
                </Text>
              </View>
            )}

            <View style={styles.mainItem}>
              <Text style={styles.mainLabel}>开具内容：</Text>
              <Text style={styles.mainContent}>
                {invoiceBillData.title.content.value}
              </Text>
            </View>


          </View>

          <TouchableOpacity
            style={styles.invoiceContainer}
            onPress={() => {
              this.navigateTo('InvoiceDetail', { invoiceBillData });
            }}
          >
            <Text style={[BaseStyles.gray, BaseStyles.text16]}>增值税专用发票：</Text>
            <View style={styles.invoiceRight}>
              <Text style={[BaseStyles.orange, BaseStyles.text16]}>
                {invoiceBillData.totalPrice}
              </Text>
              <Text style={[BaseStyles.black, BaseStyles.text16]}>
                元
              </Text>
              <Icon name="arrow-right" size={12} color="#3a3a3a" style={{ paddingLeft: 5 }} />

            </View>
          </TouchableOpacity>

        </ScrollView>

        {
          BaseInfo.erpPermission.invoiceBillBizAudit ? (
            <View style={styles.bottomBar}>
              <TouchableOpacity
                style={[styles.bottomBtn, { backgroundColor: '#fff' }]}
                onPress={() => this.navigateTo('Disagree', {
                  ...this.props.navigation.state.params,
                  keys: { InvoiceAuditList: this.props.navigation.state.key },
                },
                )}
              >
                <Text style={[BaseStyles.text16, BaseStyles.black]}>驳回</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bottomBtn, { backgroundColor: '#ffc601' }]}
                onPress={() => this.alertConfirm('AGREE')}
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
    marginTop: 10,
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
    backgroundColor: '#fff',
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
    fontSize: 16,
    width: '30%',
  },
  mainContent: {
    color: '#3a3a3a',
    fontSize: 16,
    width: '70%',
  },
  invoiceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
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
    flexDirection: 'row',
    alignItems: 'center',
  },
});

