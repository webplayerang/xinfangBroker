import React from 'react';
import {
  createBottomTabNavigator,
} from 'react-navigation';
import {
  StyleSheet,
} from 'react-native';

import TabBarItem from '../../components/TabBarItem';
import Home from './Home';
import Message from './Message';
import Me from './Me';
import Dynamic from '../HomeDynamicList/HomeDynamicList';
import { system } from '../../utils/';

// createBottomTabNavigator(RouteConfigs, BottomTabNavigatorConfig);
const TabHome = createBottomTabNavigator(
  {
    Home: {
      screen: Home,
      navigationOptions: {
        tabBarLabel: '首页',
        gesturesEnabled: false,
        tabBarIcon: ({ tintColor, focused }) => (
          <TabBarItem
            tintColor={tintColor}
            focused={focused}
            normalImage="shouye"
            selectedImage="shouye"
            size={24}
          />
        ),
      },
    },
    Dynamic: {
      screen: Dynamic,
      navigationOptions: {
        tabBarLabel: '动态',
        gesturesEnabled: false, // 是否可以右滑返回
        tabBarIcon: ({ tintColor, focused }) => (
          <TabBarItem
            tintColor={tintColor}
            focused={focused}
            normalImage="dongtai"
            selectedImage="dongtai"
            size={22}
          />
        ),
      },
    },
    Message: {
      screen: Message,
      navigationOptions: {
        tabBarLabel: '消息',
        gesturesEnabled: false, // 是否可以右滑返回
        tabBarIcon: ({ tintColor, focused }) => (
          <TabBarItem
            tintColor={tintColor}
            focused={focused}
            normalImage="xiaoxi"
            selectedImage="xiaoxi"
            size={24}
          />
        ),
      },
    },
    Me: {
      screen: Me,
      navigationOptions: {
        tabBarLabel: '我',
        gesturesEnabled: false, // 是否可以右滑返回
        tabBarIcon: ({ tintColor, focused }) => (
          <TabBarItem
            tintColor={tintColor}
            focused={focused}
            normalImage="wode"
            selectedImage="wode"
            size={24}
          />
        ),
      },
    },
  },
  {
    initialRouteName: 'Home',
    tabBarPosition: 'bottom',
    swipeEnabled: false, // 是否可以左右滑
    animationEnabled: false,
    lazy: true,
    tabBarOptions: {
      activeTintColor: '#fcb836', // 活动选项卡的标签和图标颜色。
      activeBackgroundColor: 'white', // 活动选项卡的背景色。
      inactiveTintColor: '#7e7e7e', // -"非活动" 选项卡的标签和图标颜色。
      inactiveBackgroundColor: 'white', // 非活动选项卡的背景色。
      // showLabel -是否显示选项卡的标签, 默认值为 true。
      showIcon: true, // 是否显示 Tab 的图标，默认为false。
      style: {
        ...system.isIphoneX ? { height: 40 } : {},
        ...system.isIphoneXs ? { height: 70 } : {},
        backgroundColor: 'white',
      },
      labelStyle: {
        paddingBottom: 5,
      },
      tabStyle: {
        height: 51,
        paddingTop: 5,
        backgroundColor: 'white',
        borderTopColor: '#e7e8ea',
        borderTopWidth: StyleSheet.hairlineWidth,
      },
    },
  },
);

TabHome.navigationOptions = {
  // Hide the header from AppNavigator stack
  header: null,
};
export default TabHome;
