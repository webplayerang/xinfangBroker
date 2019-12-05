import React, { PureComponent } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from '../../components/Icon';
import BaseStyles from '../../style/BaseStyles';


export default class InvoiceItem extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
    };
  }


  render() {
    const { item } = this.props.item;


    return (
      <View style={styles.containner}>


        <View style={styles.main}>
          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>楼盘房号：</Text>
            <Text style={styles.mainContent}>{item.subscribe.project.garden.name || '未知楼盘'}</Text>
          </View>

          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>成交客户：</Text>
            <Text style={styles.mainContent}>{item.subscribe.contract.customer.name}</Text>
          </View>
          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>应开票总额：</Text>
            <Text style={styles.mainContent}>{item.subscribeInvoiceInfo.totalValue.total1}元</Text>
          </View>

          <View style={styles.realTotal}>
            <Text style={[BaseStyles.text14, BaseStyles.gray, { paddingVertical: 15 }]}>本次开票总额</Text>
            <View style={styles.realTotalMain}>
              <View style={styles.mainItem}>
                <Text style={styles.mainLabelSub}>佣金：</Text>
                <Text style={styles.mainContent}>{item.limitValue.value.actual}元</Text>
              </View>
              <View style={styles.mainItem}>
                <Text style={styles.mainLabelSub}>现金奖：</Text>
                <Text style={styles.mainContent}>{item.limitValue.value.award}元</Text>
              </View>
              <View style={styles.mainItem}>
                <Text style={styles.mainLabelSub}>合作佣金：</Text>
                <Text style={styles.mainContent}>{item.limitValue.value.cooperation}元</Text>
              </View>
              <View style={styles.mainItem}>
                <Text style={styles.mainLabelSub}>开票合计：</Text>
                <View style={styles.invoiceRight}>
                  <Text style={[BaseStyles.orange, BaseStyles.text16, { fontWeight: 'bold' }]}>
                    {item.limitValue.value.total1}
                  </Text>
                  <Text style={[BaseStyles.black, BaseStyles.text16]}>
                    元
                  </Text>
                </View>
              </View>
            </View>
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

  main: {
    flex: 1,
    alignItems: 'flex-start',
  },
  mainItem: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 15,
    borderColor: '#e7e8ea',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  realTotal: {
    width: '100%',
  },
  realTotalMain: {
    width: '100%',
    backgroundColor: '#f5f5f9',
    borderColor: '#e7e8ea',
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  mainLabel: {
    color: '#a8a8a8',
    fontSize: 14,
    width: 90,
  },
  mainLabelSub: {
    color: '#a8a8a8',
    fontSize: 14,
    width: 75,
  },
  mainContent: {
    color: '#3a3a3a',
    fontSize: 14,
  },
  invoiceRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
