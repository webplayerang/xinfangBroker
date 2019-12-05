import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import BaseStyles from '../../style/BaseStyles';


export default class DealGardenItem extends PureComponent {
  static propTypes = {
    DealState: PropTypes.element.isRequired,
  }
  static defaultProps = {
    DealState: null,
  }
  constructor(props) {
    super(props);
    this.state = {
    };
  }


  render () {
    const item = this.props.item;
    return (
      <View style={styles.containner}>
        <View style={styles.header}>
          <Text style={[BaseStyles.text16, BaseStyles.gray]}>
            客户:
            <Text style={[BaseStyles.black]}>
              {`  ${item.customerName}` || '姓名未知'}
            </Text>
          </Text>
          <View style={{ flexDirection: 'row' }}>
            {this.props.dealStatusDesc}
            {this.props.dealState}
          </View>
        </View>
        <View style={styles.main}>
          <Text style={[BaseStyles.text16, BaseStyles.black]}>
            {item.dealGardenName.length > 12 ?
              item.dealGardenName.substring(0, 10) + '...'
              :
              item.dealGardenName}
          </Text>
          <Text style={[BaseStyles.text12, BaseStyles.gray]}>
            {item.createTime || '报备时间未知'}
          </Text>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  containner: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    width: '100%',
    height: 90,
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
});
