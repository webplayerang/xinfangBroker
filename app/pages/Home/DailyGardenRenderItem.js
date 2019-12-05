import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  InteractionManager,
} from 'react-native';
import ImageLoad from 'react-native-image-placeholder';
import Icon from '../../components/Icon';
import BaseStyles from '../../style/BaseStyles';

export default class DailyGardenRenderItem extends PureComponent {
  // static propTypes = {
  //   item: PropTypes.objectOf,
  //   navigation: PropTypes.objectOf,
  //   navigate: PropTypes.funcOf,
  // }
  // static defaultProps = {
  //   item: null,
  //   navigation: null,
  //   navigate: null,
  // }
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  render() {
    const item = this.props.item;
    const placeholderImage = require('../../assets/img/img-placeholder.png');
    const gardenCoverPicture = item.gardenCoverPicture.replace('{size}', '100x70');
    return (
      <TouchableOpacity
        style={styles.containner}
        onPress={() => {
          InteractionManager.runAfterInteractions(() => {
            this.props.navigation.navigate('PersonalReportList', { expandId: item.expandId, gardenName: item.gardenName, putawayStatus: item.putawayStatus });
          });
        }}
      >
        <View style={styles.leftContainner}>
          <ImageLoad
            placeholderSource={placeholderImage}
            style={{ width: 100, height: 70 }}
            loadingStyle={{ size: 'small', color: 'white' }}
            source={item.gardenCoverPicture ? { uri: gardenCoverPicture } : placeholderImage}
          >
            <Text style={styles.leftText}>{item.avgPrice}元/平米</Text>
          </ImageLoad>
        </View>
        <View style={styles.rightContainner}>
          <View>
            <Text style={[BaseStyles.black, BaseStyles.text16]}>
              {item.gardenName.length > 14 ? `${item.gardenName.substring(0, 12)}...` : item.gardenName}
            </Text>
          </View>
          <View style={styles.main}>
            <Icon name="dingwei" size={12} color="#62cdff" />
            <Text style={[BaseStyles.text12, BaseStyles.deepGray]}>{item.areaDetail || '地区未知'}</Text>
          </View>
          <View style={styles.footer}>
            <View style={styles.footerItem}>
              <Text style={[BaseStyles.text12, BaseStyles.deepGray]}>待确认</Text>
              <Text style={styles.footerYellow}>{item.reservationCount}</Text>
            </View>
            <View style={styles.footerItem}>
              <Text style={[BaseStyles.text12, BaseStyles.deepGray]}>已带看</Text>
              <Text style={styles.footerYellow}>{item.guideCount}</Text>
            </View>
            <View style={styles.footerItem}>
              <Text style={[BaseStyles.text12, BaseStyles.deepGray]}>成交</Text>
              <Text style={styles.footerYellow}>{item.dealCount}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity >
    );
  }
}
const styles = StyleSheet.create({
  containner: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    height: 115,
    marginLeft: 15,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#e7e8ea',

  },
  leftContainner: {
    alignItems: 'center',
    width: 100,
    height: 75,
    marginRight: 15,
  },
  leftText: {
    position: 'absolute',
    bottom: 0,
    height: 18,
    width: 100,
    lineHeight: 18,
    fontSize: 10,
    color: '#fff',
    backgroundColor: 'rgba(58,58,58,.5)',
    textAlign: 'center',
    includeFontPadding: false,
  },
  rightContainner: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    paddingRight: 20,

  },
  main: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 7,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  footerItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  footerYellow: {
    fontSize: 12,
    color: '#ffc601',
    paddingHorizontal: 3,
    marginRight: 5,
  },
});

