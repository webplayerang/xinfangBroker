import React, { PureComponent } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Icon from '../../components/Icon';
import BaseStyles from '../../style/BaseStyles';

export default class GardenRenderItem extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      reportData: [],
    };
  }
  render() {
    const item = this.props.item;
    return (
      <View style={styles.backgroundContainner} >
        <View style={styles.containner} >
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.textHeader}>
                {item.gardenName.length > 14 ? `${item.gardenName.substring(0, 12)}...` : item.gardenName}
              </Text>
              {item.putawayStatus === 'SOLD_OUT' ? (
                <Text style={[BaseStyles.yellow, BaseStyles.text12, { paddingLeft: 5, paddingTop: 2 }]}>{item.putawayStatusDesc}</Text>
              ) : null}
            </View>
            <Text style={styles.textHeader}>{item.avgPrice}元/平米</Text>
          </View>
          <View style={styles.main}>
            <View style={styles.mainLeft}>
              <Icon name="dingwei" size={14} color="#62cdff" />
              <Text style={styles.mainLeftText}>{item.areaDetail || '未知地区'}</Text>
            </View>
            <View style={styles.mainRight}>
              <Text style={[BaseStyles.text14, BaseStyles.deepGray]}>待确认</Text>
              <Text style={[styles.fontYellow, { paddingRight: 10 }]}>{item.reservationCount}</Text>
              <Text style={[BaseStyles.text14, BaseStyles.deepGray]}>已带看</Text>
              <Text style={styles.fontYellow}>{item.guideCount}</Text>
            </View>
          </View>
        </View>
      </View >
    );
  }
}
const styles = StyleSheet.create({
  backgroundContainner: {
    backgroundColor: '#f5f5f9',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(231,232,234,1)',
  },
  containner: {
    flexDirection: 'column',
    width: '100%',
    height: 110,
    marginTop: 10,
    paddingLeft: 15,
    backgroundColor: '#fff',
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(231,232,234,1)',
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
  },
  mainLeft: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  mainLeftText: {
    color: '#7e7e7e',
    fontSize: 14,
  },
  mainRight: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  textHeader: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
  },
  fontYellow: {
    fontSize: 14,
    color: '#ffc601',
    paddingLeft: 4,
  },
});
