import React, { PureComponent } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  InteractionManager,
} from 'react-native';
import Icon from '../../components/Icon';
import BaseStyles from '../../style/BaseStyles';

export default class MyReleaseListItem extends PureComponent {
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
    const item = this.props.item.item;


    return (
      <TouchableOpacity
        style={styles.containner}
        onPress={() => {
          InteractionManager.runAfterInteractions(() => {
            this.props.navigation.navigate('MyReleaseDetail',
              { reportId: item.id, expandName: item.expandName });
          });
        }}
      >


        <View style={styles.main}>
          <View style={[styles.footer, { paddingBottom: 15 }]}>
            <Text style={[BaseStyles.text16, BaseStyles.gray]}>楼盘名称：</Text>
            <Text style={[BaseStyles.text16, BaseStyles.black]}>
              {item.expandName.length > 10 ? `${item.expandName.substring(0, 10)}...` : item.expandName}
            </Text>
          </View>
          <Text style={[BaseStyles.text14, BaseStyles.gray]}>{item.releaseTime.substring(0, 10)}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={[BaseStyles.text14, BaseStyles.gray]}>内容：</Text>
          <Text
            style={[BaseStyles.text14, BaseStyles.black]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.title.substring(0, 14)}</Text>

        </View>

      </TouchableOpacity >
    );
  }
}
const styles = StyleSheet.create({
  containner: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 15,
    height: 81,
    marginLeft: 15,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#e7e8ea',
  },

  main: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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

