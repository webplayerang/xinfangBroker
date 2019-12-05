import React, { PureComponent } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from '../../components/Icon';
import BaseInfo from '../../common/BaseInfo';
import BaseStyles from '../../style/BaseStyles';


export default class InvoiceAuditItem extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  // 转换为 YYYY-MM-DD HH:MM:SS
  timeFormat(timer) {
    const date = new Date(timer);
    const year = date.getFullYear();
    const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
    const second = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds();
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }

  render() {
    const { item } = this.props;


    return (
      <View style={styles.containner}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[BaseStyles.text16, BaseStyles.gray, { width: 80 }]}>
              流水号：
            </Text>
            <Text style={[BaseStyles.text16, BaseStyles.black]}>
              {item.billNumber}
            </Text>
          </View>
          {
            BaseInfo.erpPermission.invoiceBillBizAudit ?
              (
                <View style={styles.btn}>
                  <Text style={[BaseStyles.text16, BaseStyles.yellow]}>
                    审批
                  </Text>
                  <Icon name="arrow-right" size={12} color="#ffc601" style={{ paddingLeft: 5 }} />
                </View>
              )
              : null
          }

        </View>

        <View style={styles.main}>
          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>楼盘名称：</Text>
            <Text style={styles.mainContent}>{item.project.name || '未知楼盘'}</Text>
          </View>

          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>申请类型：</Text>
            <Text style={styles.mainContent}>{item.dataType === 'COMMISSION' ? '分销款' : '团购费'}</Text>
          </View>

          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>申请时间：</Text>
            <Text style={styles.mainContent}>
              {this.timeFormat(item.applyDate)}
            </Text>
          </View>

        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({

  containner: {
    flexDirection: 'column',
    width: '100%',
    marginTop: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e7e8ea',
    paddingVertical: 20,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',

  },
  main: {
    flex: 1,
    alignItems: 'flex-start',
    paddingBottom: 15,
  },
  mainItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 15,

  },
  mainLabel: {
    color: '#a8a8a8',
    fontSize: 14,
    width: 80,
  },
  mainContent: {
    color: '#3a3a3a',
    fontSize: 14,
  },
});
