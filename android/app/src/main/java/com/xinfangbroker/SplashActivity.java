package com.android.xinfang;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.support.annotation.Nullable;
import android.support.v7.app.AppCompatActivity;

/**
 * @author wt
 * @Description: 闪屏页
 * @date 2017/11/16 14:17
 */
public class SplashActivity extends AppCompatActivity{
    private static final String TAG = "SplashActivity";

    private UiHandler mUiHandler;
    private static final int MSG = 1;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        init();
    }

    private void init() {
        mUiHandler = new UiHandler();
        int delay = 0;
        if (MainApplication.launched) {
            delay = 1 * 1000;
        }
        Message msg = Message.obtain();
        msg.what = MSG;
        mUiHandler.sendMessageDelayed(msg, delay);
    }

    private void enterMainAct(){
        startActivity(new Intent(SplashActivity.this , MainActivity.class));
        finish();
    }

    private class UiHandler extends Handler {
        @Override
        public void handleMessage(Message msg) {
            switch (msg.what){
                case MSG:
                    enterMainAct();
                    break;
                default:
                    break;
            }
        }

    }
}
