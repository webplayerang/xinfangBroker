import {
  StyleSheet,
} from 'react-native';
import screen from '../utils/screen';

const BaseStyles = StyleSheet.create({
  text10: {
    fontSize: 10,
  },

  text12: {
    fontSize: 12,
  },

  text14: {
    fontSize: 14,
  },
  text13: {
    fontSize: 13,
  },
  text15: {
    fontSize: 15,
  },
  text16: {
    fontSize: 16,
  },
  text17: {
    fontSize: 17,
  },
  text18: {
    fontSize: 18,
  },

  text20: {
    fontSize: 20,
  },

  text25: {
    fontSize: 25,
  },
  fzlineHeight26: {
    lineHeight: 26,
  },
  textBold: {
    fontWeight: 'bold',
  },

  container: {
    backgroundColor: '#f5f5f9',
    flex: 1,
  },

  overlay: {
    justifyContent: 'center',
    backgroundColor: '#999',
    opacity: 0.4,
    position: 'absolute',
    width: screen.width,
    height: screen.height,
    left: 0,
    top: 0,
    zIndex: 99,
    elevation: 99,
  },

  // 公用标题
  comTitleOutBox: {
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
    height: 56,
    alignItems: 'center',
    flexDirection: 'row',
  },
  comTitleBox: {
    paddingHorizontal: 10,
    borderLeftWidth: 3,
    height: 42,
    borderColor: '#ffc601',
    alignItems: 'center',
    flexDirection: 'row',
  },
  comTitle: {
    fontSize: 18,
    color: '#a8a8a8',
  },
  // 黄色框按钮
  btnOrange: {
    borderRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ffc601',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  btnOrangeTxt: {
    color: '#ffc601',
    fontSize: 16,
  },
  borderTop: {
    borderColor: '#e7e8ea',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  borderBt: {
    borderColor: '#e7e8ea',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  darkBorderTop: {
    borderColor: '#7e7e7e',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  darkBorderBt: {
    borderColor: '#a8a8a8',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  // 常用字体颜色
  comImpColor: {
    color: '#ff1515',
  },
  colorCcc: {
    color: '#ccc',
  },
  color949: {
    color: '#9497A1',
  },
  colorEB9D49: {
    color: '#EB9D49',
  },
  color000: {
    color: '#000',
  },

  black: {
    color: '#3a3a3a',
  },
  white: {
    color: '#fff',
  },
  gray: {
    color: '#a8a8a8',
  },
  deepGray: {
    color: '#7e7e7e',
  },
  yellow: {
    color: '#ffc601',
  },
  orange: {
    color: '#ff9911',
  },
  red: {
    color: '#ff0101',
  },
  blue: {
    color: '#62cdff',
  },
  green: {
    color: '#4ed5a4',
  },
  purple: {
    color: '#d5a2fc',
  },
  borderTopHair: {
    borderTopColor: '#eee',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  borderBottomHair: {
    borderBottomColor: '#eee',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  yellowCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 16,
    height: 16,
    backgroundColor: '#fff9d9',
    borderColor: '#f91',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  blueCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 16,
    height: 16,
    backgroundColor: '#ebfbff',
    borderColor: '#62cdff',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  startBetweenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowStart: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  rowEnd: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  rowCenterSpace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemrowCenterFlex: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  itemRowStartAlignEndFlex: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  // 屏幕顶部navigation内部的headerTitle文字样式
  headerTitleText: {
    color: '#3a3a3a',
    fontSize: 18,
  },
  overlayLoad: {
    justifyContent: 'center',
    backgroundColor: '#999',
    opacity: 0.4,
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
    elevation: 99,
    minHeight: screen.height,
  },
  rightBtn: {
    height: '100%',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  // scrollViewTabBar公用样式
  main: {
    height: screen.height - 60,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  lineStyle: {
    height: 3,
    backgroundColor: '#ffc601',
  },
  tabBar: {
    borderColor: '#ffc601',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabBarText: {
    fontWeight: 'normal',
  },
  // BottomBar 公用样式
  BottomBar: {
    height: 50,
  },
  // 小三角
  triangleUp: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderLeftColor: 'transparent',
    borderRightWidth: 5,
    borderRightColor: 'transparent',
    borderBottomWidth: 8,
    borderBottomColor: '#3a3a3a',
  },
  triangleDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderLeftColor: 'transparent',
    borderRightWidth: 5,
    borderRightColor: 'transparent',
    borderTopWidth: 8,
    borderTopColor: '#3a3a3a',
  },
});

export default BaseStyles;
