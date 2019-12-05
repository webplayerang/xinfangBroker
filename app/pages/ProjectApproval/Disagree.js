import React, { PureComponent } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  InteractionManager,
  DeviceEventEmitter,
} from 'react-native';

import axios from 'axios';
import Toast from 'react-native-easy-toast';
import DialogBox from '../../components/react-native-dialogbox';
import axiosErp from '../../common/AxiosInstance';
import Icon from '../../components/Icon/';
import GoBack from '../../components/GoBack';
import { system, screen } from '../../utils';
import BaseStyles from '../../style/BaseStyles';

export default class Disagree extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerTitle: '驳回原因',
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
      disagreeReason: '',
    };
  }

  componentDidMount() {
  }

  componentWillUnmount() {

  }
  // 确认弹出框
  alertConfirm(type) {
    this.dialogbox.confirm({
      title: null,
      content: (
        <View style={styles.modelBox}>
          <View style={styles.modelBoxHeader}>
            <Icon name="jingshi" size={20} color="#ffc601" style={{ width: 34 }} />
            <Text style={[BaseStyles.text16, BaseStyles.black]}>确认驳回吗？</Text>
          </View>
          <View style={styles.modelBoxMain}>
            <Text style={[BaseStyles.text14, BaseStyles.black, { lineHeight: 20 }]}>{this.state.disagreeReason}</Text>
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
          this.dialogbox.close();
          this.doAudit(type);
        },
      },
    });
  }

  doAudit(status) {
    const resultStr = status === 'AGREE' ? '审批成功' : '驳回成功';
    const { id, workflowBillId, workflowBillAuditstatus } = this.props.navigation.state.params; // 开票单据id
    let rollbackReason = {};
    if (status === 'DISAGREE') {
      rollbackReason = { rollbackReason: this.state.disagreeReason };
    }
    axiosErp.instance.get('appInvoiceBill/doAudit',
      {
        params: {
          id: workflowBillId, // 审批流程id
          targetId: id, // 开票单据id
          status, // 审核结果(通过，传”AGREE”； 驳回，传”DISAGREE”)
          auditStatus: workflowBillAuditstatus, // 审批流程审批状态
          ...rollbackReason, // 驳回原因
        },
      })
      .then((res) => {
        if (res.data.success) {
          this.toast.show(resultStr);
          this.props.navigation.goBack(this.props.navigation.state.params.keys.InvoiceAuditList);
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
    return (
      <View style={BaseStyles.container}>
        <TextInput
          style={[styles.formInput]}
          value={this.state.disagreeReason}
          placeholder="请填写驳回原因"
          autoFocus
          multiline
          maxLength={200}
          placeholderTextColor="#a8a8a8"
          underlineColorAndroid="transparent"
          onChangeText={(text) => this.setState({ disagreeReason: text.trim() })}
        />
        <View style={styles.reasonCount}>
          <Text>{this.state.disagreeReason.length}/200</Text>
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.bottomBtn}
            onPress={() => {
              if (this.state.disagreeReason) {
                this.alertConfirm('DISAGREE');
              } else {
                this.toast.show('请输入驳回原因');
              }
            }
            }
          >
            <Text style={[BaseStyles.text16, BaseStyles.white]}>提交</Text>
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
        <DialogBox ref={(dialogbox) => { this.dialogbox = dialogbox; }} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  formInput: {
    height: 210,
    fontSize: 16,
    padding: 0,
    paddingHorizontal: 10,
    marginTop: 15,
    color: '#3a3a3a',
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  reasonCount: {
    backgroundColor: '#fff',
    alignItems: 'flex-end',
  },
  bottomBar: {
    width: '92%',
    marginHorizontal: 15,
    marginTop: 15,
    backgroundColor: '#ffc601',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e7e8ea',

  },
  bottomBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 45,
  },
  modelBox: {
    width: '100%',
    alignItems: 'center',
  },
  modelBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modelBoxMain: {
    width: '80%',
    marginTop: 15,
  },
});
