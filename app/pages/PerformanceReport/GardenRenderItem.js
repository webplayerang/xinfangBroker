import React, { PureComponent } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
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
      <View style={styles.backgroundContainner}>
        <View style={styles.containner} >
          <View style={styles.header}>
            <Text style={[BaseStyles.text16, BaseStyles.black]}>
              {item.expandName.length > 13 ? `${item.expandName.substring(0, 8)}...` : item.expandName}
            </Text>
            <Text style={[BaseStyles.text14, BaseStyles.gray, { paddingLeft: 5 }]}>
              （{item.orgName}）
            </Text>
          </View>
          <View style={styles.main}>
            <View style={styles.mainLeft}>
              <Text style={[BaseStyles.text14, BaseStyles.gray]}>带看：</Text>
              <Text style={[BaseStyles.text14, BaseStyles.black]}>
                {item.guideCount}
              </Text>
            </View>
            <View style={styles.mainMiddle}>
              <Text style={[BaseStyles.text14, BaseStyles.gray, { paddingLeft: 20 }]}>成交：</Text>
              <Text style={[BaseStyles.text14, BaseStyles.black]}>
                {item.volume}
              </Text>
            </View>
            <View style={styles.mainRight}>
              <Text style={[BaseStyles.text14, BaseStyles.gray, { paddingLeft: 20 }]}>营收：</Text>
              <Text style={[BaseStyles.text14, BaseStyles.yellow, { fontWeight: 'bold' }]}>
                {`${(item.revenueAmount / 10000).toFixed(2)}`.replace('.00', '')}
              </Text>
              <Text style={[BaseStyles.text14, BaseStyles.black]}>
                万元
              </Text>
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
    paddingTop: 10,
  },
  containner: {
    flexDirection: 'column',
    width: '100%',
    // backgroundColor: '#f5f5f9',

    // height: 75,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e7e8ea',
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    // alignItems: 'flex-start',
    // paddingTop: 4,
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
  mainMiddle: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  mainRight: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  textHeader: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
  },
  fontYellow: {
    fontSize: 16,
    color: '#ffc601',
    paddingHorizontal: 5,
  },
});
