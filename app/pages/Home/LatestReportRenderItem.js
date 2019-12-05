import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  InteractionManager,
} from 'react-native';
import BaseStyles from '../../style/BaseStyles';


export default class LatestReportRenderItem extends PureComponent {
  static propTypes = {
    reportState: PropTypes.element,
    phoneIcon: PropTypes.element,
  }
  static defaultProps = {
    reportState: null,
    phoneIcon: null,
  }
  constructor(props) {
    super(props);
    this.state = {
      reportData: [],
    };
    this.navigateTo = this.navigateTo.bind(this);
  }
  navigateTo () {
    const reservationId = this.props.item.reservationId;
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate('ReportDetail', { reservationId });
    });
  }

  render () {
    const item = this.props.item;
    return (
      <TouchableOpacity
        style={styles.containner}
        onPress={this.navigateTo}
      >
        <View style={styles.header}>
          <Text style={[BaseStyles.text16, BaseStyles.black, styles.fontWeight]}>
            {item.gardenName.length > 14 ? `${item.gardenName.substring(0, 12)}...` : item.gardenName}
          </Text>
          {this.props.reportState}
        </View>
        <View style={styles.main}>
          <View style={{ flexDirection: 'row' }}>
            <View style={[BaseStyles.yellowCircle, { marginRight: 5 }]}>
              <Text style={[BaseStyles.text10, BaseStyles.yellow]}>带</Text>
            </View>
            <Text style={[BaseStyles.text14, BaseStyles.black]} >
              {item.brokerName}
              <Text style={BaseStyles.gray}>
                {
                  ` ${item.companyName} ${item.storeName}`.length > 18 ?
                    `${`${item.companyName} ${item.storeName}`.substring(0, 16)}...` :
                    `${item.companyName} ${item.storeName}`
                }
              </Text>
            </Text>
          </View>
          {this.props.phoneIcon}
        </View>
        <View style={styles.footer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[BaseStyles.blueCircle, { marginRight: 5 }]}>
              <Text style={[BaseStyles.text10, BaseStyles.blue]}>客</Text>
            </View>
            <Text style={[BaseStyles.text14, BaseStyles.black]}>
              {item.customerName}
            </Text>
            <Text style={[BaseStyles.text14, BaseStyles.gray]}>
              {` ${item.customerPhone}`}
            </Text>
          </View>
          <View>
            <Text style={[BaseStyles.gray, BaseStyles.text12]}>
              {item.submitTime.replace('.0', '').substring(5) || '报备时间未知'}
            </Text>
          </View>
        </View>
      </TouchableOpacity >
    );
  }
}
const styles = StyleSheet.create({
  containner: {
    flexDirection: 'column',
    width: '100%',
    height: 105,
    paddingRight: 30,
    paddingVertical: 15,
    marginLeft: 15,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#e7e8ea',
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  main: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  footer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fontWeight: {
    fontWeight: '400',
  },
});
