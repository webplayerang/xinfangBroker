/* eslint-disable react/prop-types */
// 上数页面
import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  DeviceEventEmitter,
} from 'react-native';
import { withNavigation } from 'react-navigation';

import BaseStyle from '../../../style/BaseStyles';


const HouseSearchItem = (props) => {
  function onClickItemEvent() {
    DeviceEventEmitter.emit(props.deviceEventName, { name: props.item.extendName, id: props.item.expandId });
    props.navigation.navigate(props.returnpageName);
  }
  return (
    <TouchableOpacity
      style={styles.itemPage}
      onPress={onClickItemEvent}
    >
      <View style={[styles.itemTextPage, BaseStyle.borderBt]}>
        <Text style={[BaseStyle.text14, BaseStyle.lightGray]}>{props.item.extendName}</Text>
      </View >
    </TouchableOpacity >
  );
};


const styles = StyleSheet.create({
  itemPage: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,

  },
  itemTextPage: {
    paddingVertical: 16,
    paddingHorizontal: 10,

    borderTopColor: '#eee',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});

export default withNavigation(HouseSearchItem);
