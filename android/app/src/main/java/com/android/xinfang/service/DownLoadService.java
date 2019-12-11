package com.android.xinfang.service;

import android.app.IntentService;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.Message;
import android.support.annotation.Nullable;
import android.widget.RemoteViews;

import com.android.xinfang.MainActivity;
import com.android.xinfang.R;
import com.android.xinfang.constant.AppConstant;
import com.android.xinfang.utils.SharePreUtils;
import com.android.xinfang.utils.Utils;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

/**
 * @author wt
 * @Description: 描述
 * @date 2017/11/16 15:52
 */
public class DownLoadService extends IntentService {

    private NotificationManager mNotificationManager;
    private String mUrl;
    private String mNewVersion;
    private Notification mNotification;
    private String mTitle = "正在下载";
    public static boolean isDownloading = false;

    private Handler mHandler = new Handler() {
        @Override
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case 0:
                    mNotificationManager.cancel(0);
                    installApk();
                    break;
                case 1:
                    int rate = msg.arg1;
                    if (rate < 100) {
                        RemoteViews views = mNotification.contentView;
                        views.setTextViewText(R.id.tv_download_progress, mTitle + "(" + rate
                                + "%" + ")");
                        views.setProgressBar(R.id.pb_progress, 100, rate,
                                false);
                        mNotificationManager.notify(0, mNotification);
                    } else {
                        mNotificationManager.cancel(0);
                    }
                    break;
            }

        }
    };

    public DownLoadService() {
        this("DownLoadService");
    }

    /**
     * Creates an IntentService.  Invoked by your subclass's constructor.
     *
     * @param name Used to name the worker thread, important only for debugging.
     */
    public DownLoadService(String name) {
        super(name);
    }

    @Override
    public void onCreate() {
        super.onCreate();
        isDownloading = true;
        mNotificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    }

    @Override
    protected void onHandleIntent(@Nullable Intent intent) {
        mUrl = intent.getStringExtra("url");
        mNewVersion = intent.getStringExtra("newVersion");

        setUpNotification();
        File file = Utils.getSaveApk(mNewVersion);
        try {
            downloadApp(mUrl, file);
        } catch (Exception e) {
            e.printStackTrace();
            //失败，清空文件
            mNotificationManager.cancel(0);
            file.delete();
        }
    }

    private void setUpNotification() {
        int icon = R.mipmap.ic_launcher;
        CharSequence tickerText = "开始下载";
        Notification.Builder builder = new Notification.Builder(this);
        mNotification = builder.
                setContentText(tickerText)
                .setSmallIcon(icon)
                .setContentTitle(getString(getApplicationInfo().labelRes))
                .build();

        mNotification.flags = Notification.FLAG_ONGOING_EVENT;

        RemoteViews contentView = new RemoteViews(getPackageName(),
                R.layout.layout_notification_view);
        contentView.setTextViewText(R.id.tv_download_progress, mTitle);
        mNotification.contentView = contentView;

        Intent intent = new Intent(this, MainActivity.class);
        PendingIntent contentIntent = PendingIntent.getActivity(this, 0,
                intent, PendingIntent.FLAG_UPDATE_CURRENT);

        mNotification.contentIntent = contentIntent;
        mNotificationManager.notify(0, mNotification);
    }

    private void downloadApp(String downloadUrl, File saveFile) throws Exception {
        int downloadCount = 0;
        long totalSize = 0;
        int updateTotalSize = 0;

        HttpURLConnection httpConnection = null;
        InputStream is = null;
        FileOutputStream fos = null;

        try {
            URL url = new URL(downloadUrl);
            httpConnection = (HttpURLConnection) url.openConnection();
            //证书
            boolean useHttps = downloadUrl.startsWith("https");
            if (useHttps) {
                HttpsURLConnection https = (HttpsURLConnection) httpConnection;
                trustAllHosts(https);
//                https.getHostnameVerifier();
                https.setHostnameVerifier(DO_NOT_VERIFY);
            }

            httpConnection.setRequestMethod("GET");
            httpConnection.setRequestProperty("Accept-Encoding", "identity");
            httpConnection.addRequestProperty("Connection", "keep-alive");
            httpConnection.setConnectTimeout(30 * 1000);
            httpConnection.setReadTimeout(30 * 1000);
            httpConnection.setChunkedStreamingMode(1024 * 100);

            httpConnection.connect();
            int responseCode = httpConnection.getResponseCode();
            if (responseCode < 200 || responseCode > 300) {
                throw new RuntimeException();
            }
            updateTotalSize = httpConnection.getContentLength();

            saveDownloadInfo(updateTotalSize);

            is = httpConnection.getInputStream();
            fos = new FileOutputStream(saveFile, false);
            byte[] buff = new byte[2048];
            int len = 0;
            while ((len = is.read(buff)) > 0) {
                fos.write(buff, 0, len);
                totalSize += len;
                if ((downloadCount == 0)
                        || (int) (totalSize * 100 / updateTotalSize) - 4 > downloadCount) {
                    downloadCount += 4;
                    Message msg = mHandler.obtainMessage();
                    msg.what = 1;
                    msg.arg1 = downloadCount;
                    mHandler.sendMessage(msg);
                }
            }
            fos.flush();
            mHandler.sendEmptyMessage(0);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (httpConnection != null) {
                httpConnection.disconnect();
            }
            Utils.close(fos, is);
        }
    }

    private void saveDownloadInfo(int updateTotalSize) {
        SharePreUtils.set(AppConstant.Update.fileName , AppConstant.Update.keyTotalByte , updateTotalSize);
        SharePreUtils.set(AppConstant.Update.fileName , AppConstant.Update.keyVersionName , mNewVersion);
    }

    private void installApk() {
        File file = Utils.getSaveApk(mNewVersion);
        Utils.installApk(this, file);
    }

    public static void startService(Context context, String downloadUrl, String newVersion) {
        Intent intent = new Intent(context, DownLoadService.class);
        intent.putExtra("url", downloadUrl);
        intent.putExtra("newVersion", newVersion);
        context.startService(intent);
    }

    public static File getSaveApk(String newVersion) {
        return Utils.getSaveApk(newVersion);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        isDownloading = false;
        if (null != mHandler) {
            mHandler.removeCallbacksAndMessages(null);
        }
    }

    /**
     * 覆盖java默认的证书验证
     */
    private static final TrustManager[] trustAllCerts = new TrustManager[]{new X509TrustManager() {
        public java.security.cert.X509Certificate[] getAcceptedIssuers() {
            return new java.security.cert.X509Certificate[]{};
        }

        public void checkClientTrusted(X509Certificate[] chain, String authType)
                throws CertificateException {
        }

        public void checkServerTrusted(X509Certificate[] chain, String authType)
                throws CertificateException {
        }
    }};

    /**
     * 设置不验证主机
     */
    private static final HostnameVerifier DO_NOT_VERIFY = new HostnameVerifier() {
        public boolean verify(String hostname, SSLSession session) {
            return true;
        }
    };

    /**
     * 信任所有
     *
     * @param connection
     * @return
     */
    private static SSLSocketFactory trustAllHosts(HttpsURLConnection connection) {
        SSLSocketFactory oldFactory = connection.getSSLSocketFactory();
        try {
            //创建SSLContext
            SSLContext sc = SSLContext.getInstance("TLS");
            //初始化
            sc.init(null, trustAllCerts, new java.security.SecureRandom());
            SSLSocketFactory newFactory = sc.getSocketFactory();
            connection.setSSLSocketFactory(newFactory);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return oldFactory;
    }
}
