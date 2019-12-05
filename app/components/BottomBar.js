// 底部工具栏
import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from './Icon/';
import { screen, system } from '../utils/';

export default class BottomBar extends PureComponent {
  render() {
    return (
      <View style={[
        styles.container,
        this.props.top ?
          { top: 0, borderBottomWidth: StyleSheet.hairlineWidth } :
          { bottom: 0, borderTopWidth: StyleSheet.hairlineWidth },
        system.isIphoneX ? styles.iphoneXStyle : null,
        system.isIphoneXs ? styles.iphoneXsStyle : null,
      ]}
      >
        {
          this.props.data.map((item, index) => (
            <TouchableOpacity
              key={item.text}
              style={styles.btn}
              onPress={item.onPress}
            >
              <Icon name={item.iconName} size={item.iconSize} color={item.iconColor} />
              <Text style={[styles.text, item.textStyle]}> {item.text}</Text>
            </TouchableOpacity >))
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: screen.width,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderColor: '#a8a8a8',
    height: 51,
  },

  btn: {
    alignItems: 'center',
  },

  text: {
    fontSize: 11,
    color: '#3a3a3a',
    marginTop: 2,
  },

  iphoneXStyle: {
    height: 71,
    paddingBottom: 35,
  },
  iphoneXsStyle: {
    height: 100,
    paddingBottom: 50,
  },
});
