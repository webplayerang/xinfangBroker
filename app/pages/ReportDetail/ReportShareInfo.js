import React, { PureComponent } from 'react';
import {
  View,
  StyleSheet,
  Text,
} from 'react-native';
import Icon from '../../components/Icon/';

// 报备详情底部按钮页面

class ReportShareInfo extends PureComponent {
  render() {
    const reportDetailData = this.props.reportDetailData;
    return (
      <View style={styles.shareModel} >
        <View style={styles.modelShareTilteBox}>
          <Icon name="zhengque" size={20} color="#4ed5a4" style={styles.tipIcon} />
          <Text style={styles.modelTilte}>已为您生成客户信息</Text>
        </View>
        <View style={styles.shareImpPt}>
          <View style={styles.flexRow}>
            <View style={styles.shareLeft}>
              <Text style={styles.shareText}>经纪人：<Text style={[styles.shareText, styles.darkColor]} >{reportDetailData.brokerName}</Text></Text>
            </View>
            <View>
              <Text style={styles.shareText}>电话：<Text style={[styles.shareText, styles.darkColor]} >{reportDetailData.brokerPhone}</Text></Text>
            </View>
          </View>
          <View style={styles.sharePt}>
            <Text style={styles.shareText12}>归属：<Text style={styles.shareText12}>{reportDetailData.companyName || ''}{reportDetailData.storeName || ''}</Text></Text>
          </View>
        </View>
        <View style={styles.shareImpPt}>
          <View style={styles.flexRow}>
            <View style={styles.shareLeft}>
              <Text style={styles.shareText}>客户：<Text style={[styles.shareText, styles.darkColor]}>{reportDetailData.customerName || ''}</Text></Text>
            </View>
            <View>
              <Text style={styles.shareText}>电话：<Text style={[styles.shareText, styles.darkColor]}>{reportDetailData.customerPhone}</Text></Text>
            </View>
          </View>
          <View style={styles.sharePt}>
            <Text style={styles.shareText12}>报备项目：<Text style={[styles.shareText12, styles.darkColor]}>{reportDetailData.gardenName}</Text></Text>
          </View>
        </View>
        <View style={styles.shareImpPt} >
          <View>
            <Text style={styles.shareText12}>报备时间：<Text style={styles.shareText12}>{reportDetailData.submitTime && reportDetailData.submitTime.substring(0, 16)}</Text></Text>
          </View>
          {reportDetailData.appointmentTime ?
            <View style={styles.sharePt}>
              <Text style={[styles.shareText12]}>到访时间：<Text style={[styles.shareText12]}>{reportDetailData.appointmentTime.substring(0, 16)}</Text></Text>
            </View> : null}
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  shareModel: {
    width: '100%',
    marginTop: -20,
  },
  modelShareTilteBox: {
    paddingLeft: 15,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    height: 54,
    borderColor: '#e7e8ea',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  shareText: {
    fontSize: 14,
    color: '#a8a8a8',
  },
  shareText12: {
    fontSize: 12,
    color: '#a8a8a8',
  },
  shareImpPt: {
    paddingTop: 18,
    paddingLeft: 15,
  },
  sharePt: {
    paddingTop: 8,
  },
  shareLeft: {
    width: 130,
  },
  darkColor: {
    color: '#3a3a3a',
  },
  flexRow: {
    flexDirection: 'row',
  },
  tipIcon: {
    width: 34,
  },
  modelTilte: {
    fontSize: 16,
    color: '#3a3a3a',
  },
});
export default ReportShareInfo;
