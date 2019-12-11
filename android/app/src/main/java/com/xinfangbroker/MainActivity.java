package com.android.xinfang;

import com.android.xinfang.bean.UpdateBean;
import com.android.xinfang.constant.AppConfig;
import com.android.xinfang.constant.AppConstant;
import com.android.xinfang.dialog.DialogEventInterface;
import com.android.xinfang.dialog.UpdateDialogFragment;
import com.android.xinfang.service.DownLoadService;
import com.android.xinfang.utils.SharePreUtils;
import com.android.xinfang.utils.Utils;
import com.facebook.react.ReactFragmentActivity;
import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler;

import java.io.File;
import java.io.IOException;
import java.lang.Override;
import java.util.concurrent.TimeUnit;

import android.os.Bundle;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.Looper;
import android.os.Message;
import android.support.annotation.WorkerThread;
import android.util.Log;
import android.widget.Toast;

import cn.jpush.android.api.JPushInterface;
import okhttp3.Call;
import okhttp3.FormBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

import com.google.gson.Gson;
import com.umeng.analytics.MobclickAgent;

import org.json.JSONException;
import org.json.JSONObject;

public class MainActivity extends ReactFragmentActivity implements DefaultHardwareBackBtnHandler, DialogEventInterface {

    private static final int MSG_CHECK_UPDATE = 0x11;
    private static final int MSG_SHOW_UPDATE_DIALOG = 0x12;

    private HandlerThread mHandlerThread;
    private ThreadHandler mThreadHandler;
    private UiHandler mUiHandler;

    private boolean mHasLocalApk = false;
    private UpdateBean mUpdateBean = null;

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        JPushInterface.init(this);
        Log.i("MainActivity", "onCreate executed!");
        init();
    }

    private void init() {
        mHandlerThread = new HandlerThread("MainActivity-Create");
        mHandlerThread.start();
        mThreadHandler = new ThreadHandler(mHandlerThread.getLooper());
        mUiHandler = new UiHandler();

        mThreadHandler.sendEmptyMessage(MSG_CHECK_UPDATE);
    }

    @Override
    protected String getMainComponentName() {
        return "xinfangBroker";
    }

    @Override
    protected void onPause() {
        super.onPause();
        JPushInterface.onPause(this);
        MobclickAgent.onPause(this);
    }

    @Override
    protected void onResume() {
        super.onResume();
        JPushInterface.onResume(this);
        MobclickAgent.onResume(this);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if(null != mUiHandler){
            mUiHandler.removeCallbacksAndMessages(null);
        }
        if(null != mThreadHandler){
            mThreadHandler.removeCallbacksAndMessages(null);
        }

        if(null != mHandlerThread){
            mHandlerThread.quit();
        }
    }

    private String generateParams() throws JSONException {
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("osType", "Android");
        jsonObject.put("productId", BuildConfig.PRODUCT_ID);//新房
        jsonObject.put("version", Utils.getLocalVersion(MainActivity.this));
        jsonObject.put("userType", "2");

        return jsonObject.toString();
    }

    /**
     * 版本升级
     * 子线程中执行
     *
     * @throws JSONException
     */
    @WorkerThread
    private void checkUpdate() throws JSONException {
        if (DownLoadService.isDownloading) {
            return;
        }

        OkHttpClient client = new OkHttpClient.Builder()
                .connectTimeout(30 * 1000, TimeUnit.MILLISECONDS)
                .readTimeout(30 * 1000, TimeUnit.MILLISECONDS)
                .writeTimeout(30 * 1000, TimeUnit.MILLISECONDS)
                .build();

        FormBody body = new FormBody.Builder()
                .add("params", generateParams())
                .build();

        final Request request = new Request.Builder()
                .url(AppConfig.UPDATE_APP)
                .post(body)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .build();

        Call call = client.newCall(request);
        try {
            Response response = call.execute();
            if (response.isSuccessful()) {
                String respStr = response.body().string();
                try {
                    JSONObject jsonObject = new JSONObject(respStr);
                    if (jsonObject != null && jsonObject.has("data") && !jsonObject.isNull("data")) {
                        String data = jsonObject.getString("data");
                        Gson gson = new Gson();
                        UpdateBean updateBean = gson.fromJson(data, UpdateBean.class);
                        if (null != updateBean && updateBean.needUpdate) {
                            mUpdateBean = updateBean;
                            mHasLocalApk = hasLocalApk(updateBean.newVersion);
                            showUpdateDialog(mHasLocalApk, updateBean.updateTips, updateBean.forceUpdate);
                        }
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private boolean hasLocalApk(String newVersion) {
        String saveVersion = SharePreUtils.get(AppConstant.Update.fileName, AppConstant.Update.keyVersionName, "");
        int saveTotalBytes = SharePreUtils.get(AppConstant.Update.fileName, AppConstant.Update.keyTotalByte, -1);
        File saveApk = Utils.getSaveApk(newVersion);

        if (saveVersion.equals(newVersion) && null != saveApk && saveApk.length() == saveTotalBytes) {
            return true;
        }
        return false;
    }

    private void showUpdateDialog(boolean hasLocalApk, String tips, boolean forceUpdate) {
        UpdateDialogFragment.newInstance(tips, hasLocalApk, forceUpdate)
                .show(getSupportFragmentManager(), "");
    }

    /**
     * 升级对话框,取消
     */
    @Override
    public void cancel() {

    }

    /**
     * 升级对话框,确定
     */
    @Override
    public void confirm() {
        if (null == mUpdateBean) {
            return;
        }
        if (mHasLocalApk) {
            Utils.installApk(MainActivity.this, Utils.getSaveApk(mUpdateBean.newVersion));
        } else {
            DownLoadService.startService(MainActivity.this, mUpdateBean.downloadUrl, mUpdateBean.newVersion);
        }
    }

    private class UiHandler extends Handler {
        @Override
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case MSG_SHOW_UPDATE_DIALOG:
                    break;
                default:
                    break;
            }
        }
    }

    private class ThreadHandler extends Handler {
        public ThreadHandler() {
        }

        public ThreadHandler(Looper looper) {
            super(looper);
        }

        @Override
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case MSG_CHECK_UPDATE:
                    try {
                        checkUpdate();
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                    break;
                default:
                    break;
            }
        }
    }
}
