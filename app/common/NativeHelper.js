import { NativeModules } from 'react-native';

// android 端
let umeng = NativeModules.UmengNativeModule;
let helper = NativeModules.QFReactHelper;

function fakeNative(...args) {

}

// ios 端
if (!umeng) {
  umeng = NativeModules.UMNative;
}

if (__DEV__) {
  if (!helper) {
    helper = {};
    const methods = ['navPop', 'logout', 'show', 'statistical', 'hideDialog', 'showMainTabbar', 'showPage'];
    methods.forEach((method) => { helper[method] = fakeNative; });
  }

  if (!umeng) {
    umeng = {};

    const methods = ['onEvent', 'onPageBegin', 'onPageEnd'];
    methods.forEach((method) => { umeng[method] = fakeNative; });
  }
}

export const QFReactHelper = helper;

export const UMNative = umeng;
