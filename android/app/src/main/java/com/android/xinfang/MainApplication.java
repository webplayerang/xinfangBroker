package com.android.xinfang;

import android.app.Application;
import android.content.Context;

import com.reactnativecomponent.barcode.RCTCapturePackage;
import com.facebook.react.ReactApplication;
import com.github.yamill.orientation.OrientationPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.corbt.keepawake.KCKeepAwakePackage;
import com.brentvatne.react.ReactVideoPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.rnfs.RNFSPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.beefe.picker.PickerViewPackage;
import com.microsoft.codepush.react.CodePush;
import com.rt2zz.reactnativecontacts.ReactNativeContacts;
import cn.jpush.reactnativejpush.JPushPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  // 设置为 true 将不弹出 toast
  private boolean SHUTDOWN_TOAST = false;
  // 设置为 true 将不打印 log
  private boolean SHUTDOWN_LOG = false;

  private static Context mContext;

  public static boolean launched = false;

  private ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
  // private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

    @Override
    protected String getJSBundleFile() {
      return CodePush.getJSBundleFile();
    }

    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
          new OrientationPackage(),
          new VectorIconsPackage(),
          new KCKeepAwakePackage(),
          new ReactVideoPackage(),
          new LinearGradientPackage(),
          new RNFSPackage(),
          new RCTCapturePackage(),
          new RNDeviceInfo(),
          new PickerViewPackage(),
          new CodePush(BuildConfig.CODEPUSH_KEY,getApplicationContext(), BuildConfig.DEBUG,"http://code-push.qfang.com:8899/"),
          new JPushPackage(SHUTDOWN_TOAST, SHUTDOWN_LOG),
          new ReactNativeContacts(),
          new UmengReactPackage()
      );
    }
  };

  public void setReactNativeHost(ReactNativeHost reactNativeHost) {
    mReactNativeHost = reactNativeHost;
  }

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

   @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    launched = true;
    mContext = this;
  }

  public static Context getContext() {
    return mContext;
  }
}
