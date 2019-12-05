import React from 'react';
import {
  Text,
  View,
  StyleSheet,
} from 'react-native';
import baseStyles from '../../style/BaseStyles';

export default function (store) {
  return (
    <View>
      <View style={[baseStyles.borderTop, styles.infoItem]}>
        <View>
          <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>成交客户：</Text>
        </View>
        <View>
          <Text style={[styles.comRightTxt, baseStyles.text14]}>{store.dealCustomerName}</Text>
        </View>
      </View>
      <View style={[baseStyles.borderTop, styles.infoItem]}>
        <View>
          <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>联系方式：</Text>
        </View>
        <View>
          <Text style={[styles.comRightTxt, baseStyles.text14]}>{store.dealCustomerPhone}</Text>
        </View>
      </View>
      <View style={[baseStyles.borderTop, styles.infoItem]}>
        <View>
          <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>付款方式：</Text>
        </View>
        <View>
          <Text style={[styles.comRightTxt, baseStyles.text14]}>{store.payTypeValue}</Text>
        </View>
      </View>
      <View style={[baseStyles.borderTop, styles.infoItem]}>
        <View>
          <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>认购日期：</Text>
        </View>
        <View>
          <Text style={[styles.comRightTxt, baseStyles.text14]}>{store.buyDate}</Text>
        </View>
      </View>
      <View style={[baseStyles.borderTop, styles.infoItem]}>
        <View>
          <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>签约日期：</Text>
        </View>
        <View>
          <Text style={[styles.comRightTxt, baseStyles.text14]}>{store.createDate}</Text>
        </View>
      </View>
      <View style={[baseStyles.borderTop, styles.infoItem]}>
        <View>
          <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>房号：</Text>
        </View>
        <View>
          <Text style={[styles.comRightTxt, baseStyles.text14]}>{store.roomDesc}</Text>
        </View>
      </View>
      <View style={[baseStyles.borderTop, styles.infoItem]}>
        <View>
          <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>面积：</Text>
        </View>
        <View>
          <Text style={[styles.comRightTxt, baseStyles.text14]}>{store.area ? `${store.area} ㎡` : ''}</Text>
        </View>
      </View>
      <View style={[baseStyles.borderTop, styles.infoItem]}>
        <View>
          <Text style={[styles.comLeftTxt, baseStyles.text14, styles.leftWidth]}>成交总价：</Text>
        </View>
        <View>
          <Text style={[styles.comRightTxt, baseStyles.text14]}>{store.totalPrice ? `${store.totalPrice} 元` : ''}</Text>
        </View>
      </View>
    </View>
  );
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
  infoItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    height: 44,
    alignItems: 'center',
    flexDirection: 'row',
  },
  comLeftTxt: {
    color: '#7e7e7e',
    fontSize: 14,
  },
  comRightTxt: {
    color: '#3a3a3a',
    fontSize: 14,
  },
  leftWidth: {
    width: 88,
  },
  leftWider: {
    width: 120,
  },
});
