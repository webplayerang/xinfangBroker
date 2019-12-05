import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  View, StyleSheet,
  TouchableOpacity,
} from 'react-native';
// 友盟统计
import { UMNative } from '../../common/NativeHelper';
import Icon from '../../components/Icon/';
import baseStyles from '../../style/BaseStyles';

// 报备详情页面

class RecognizeItem extends PureComponent {
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
    this.state = {
      expanded: true,
    };
  }
  // 标题处理
  titleJSX(data) {
    const navigation = this.props.navigation;
    const item = data.item;
    const status = item.statusDesc || '';
    const routeName = navigation.state.routeName;
    let enEdit = false;
    let statusColor = '#ff1515';
    if (status === '审核通过' || status === '已出纳确认' || status === '审核未通过') {
      statusColor = '#4ed5a4';
    }
    if (status === '待审核' || routeName === 'EditBasicRecognize') {
      enEdit = true;
    }
    const detaultJsx = <View><Text style={styles.titleTxt}>收款信息（{data.index + 1}）<Text style={{ color: statusColor, fontSize: 14 }}>{item.statusDesc}</Text></Text></View>;
    if (enEdit) {
      return (
        <TouchableOpacity onPress={() => {
          // 统计修改认筹款按钮点击数
          UMNative.onEvent('EDIT_RECOGNIZE_COUNT');
          navigation.navigate('EditReceipts', { data, expandId: this.props.expandId, editNeed: this.props.editNeed });
        }
        }
        >
          <View style={[styles.list, styles.pr0, { marginTop: 10 }]} >
            {detaultJsx}
            <View style={styles.rightBtn} >
              <Text style={baseStyles.btnOrangeTxt}>编辑</Text>
              <View style={styles.rightIcon} >
                <Icon name="arrow-right" size={16} color="#3a3a3a" />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
    return (
      <View style={[styles.list, styles.pr0, { marginTop: 10 }]} >
        {detaultJsx}
      </View>
    );
  }

  render() {
    const data = this.props.data;
    const item = data.item;
    return (
      <View>
        {/* 标题 */}
        {this.titleJSX(data)}
        {/* 内容 */}
        {/* {
          this.state.expanded && */}
        <View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>收款金额：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{(item.incomePrice && `${item.incomePrice}元`) || ''}</Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>收款时间：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{(item.gatheringDate && item.gatheringDate.substring(0, 10)) || ''}</Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>交款账户名：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{item.payAccountName || ''}</Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>收据号：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{item.noteNumber || ''}</Text>
            </View>
          </View>
          {item.gatheringTypeDesc === 'POS机' &&
            <View style={[baseStyles.borderTop, styles.infoItem]}>
              <View>
                <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>系统参考号：</Text>
              </View>
              <View>
                <Text style={[styles.comRightTxt, baseStyles.text14]}>{item.refNumber || ''}</Text>
              </View>
            </View>}
          {item.gatheringTypeDesc === 'POS机' &&
            <View style={[baseStyles.borderTop, styles.infoItem]}>
              <View>
                <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>终端号：</Text>
              </View>
              <View>
                <Text style={[styles.comRightTxt, baseStyles.text14]}>{item.terminalNumber || ''}</Text>
              </View>
            </View>}
          {item.gatheringTypeDesc === '转账' &&
            <View style={[baseStyles.borderTop, styles.infoItem]}>
              <View>
                <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>收款银行：</Text>
              </View>
              <View>
                <Text style={[styles.comRightTxt, baseStyles.text14]}>{item.gatheringBank || ''}</Text>
              </View>
            </View>}
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>银行账号：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{item.bankAccountNumber || ''}</Text>
            </View>
          </View>
          {item.gatheringTypeDesc === '转账' &&
            <View style={[baseStyles.borderTop, styles.infoItem]}>
              <View>
                <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>交易流水号：</Text>
              </View>
              <View>
                <Text style={[styles.comRightTxt, baseStyles.text14]}>{item.businessNumber || ''}</Text>
              </View>
            </View>}
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>经办人：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{item.operatorName || ''}</Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>业务实体：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{item.businessEntityName || ''}</Text>
            </View>
          </View>
          <View style={[baseStyles.borderTop, styles.infoItem]}>
            <View>
              <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>收款方式：</Text>
            </View>
            <View>
              <Text style={[styles.comRightTxt, baseStyles.text14]}>{item.gatheringTypeDesc || ''}</Text>
            </View>
          </View>
        </View>
      </View >


    );
  }
}


const styles = StyleSheet.create({
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
    height: 44,
    alignItems: 'center',
    flexDirection: 'row',
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

export default RecognizeItem;
