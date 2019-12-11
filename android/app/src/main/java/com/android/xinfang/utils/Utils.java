package com.android.xinfang.utils;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;

import com.android.xinfang.MainApplication;
import com.android.xinfang.constant.AppConstant;

import java.io.Closeable;
import java.io.File;
import java.io.IOException;

/**
 * @author wt
 * @Description: 描述
 * @date 2017/11/16 18:33
 */
public class Utils {
    /**
     * 获取当前本地版本号
     *
     * @param context
     * @return
     */
    public static String getLocalVersion(Context context) {
        try {
            PackageInfo info = context.getPackageManager().getPackageInfo(
                    context.getPackageName(), 0);
            return info.versionName;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * 安装apk
     *
     * @param context
     * @param file
     */
    public static void installApk(Context context, File file) {
        if(file == null || !file.exists()){
            return;
        }
        Intent intent = new Intent(Intent.ACTION_VIEW);
        //TODO 适配android7.0
        Uri uri = Uri.fromFile(file);
        intent.setDataAndType(uri, "application/vnd.android.package-archive");
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        context.startActivity(intent);
    }

    /**
     * @param closeables
     */
    public static void close(Closeable... closeables) {
        if (closeables == null || closeables.length == 0)
            return;
        for (Closeable closeable : closeables) {
            if (closeable != null) {
                try {
                    closeable.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    public static boolean isWifiOpen() {
        ConnectivityManager cm = (ConnectivityManager) MainApplication.getContext()
                .getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo info = cm.getActiveNetworkInfo();
        if (info == null) return false;
        if (!info.isAvailable() || !info.isConnected()) return false;
        if (info.getType() != ConnectivityManager.TYPE_WIFI) return false;
        return true;
    }

    /**
     * 下载APK的目录
     * @return
     */
    public static String getSaveApkDir() {
        File externalCacheDir = MainApplication.getContext().getExternalCacheDir();
        String dirName = AppConstant.DOWNLOAD_APK_DIR;
        File file = new File(externalCacheDir, dirName);
        if (!file.exists()) {
            file.mkdirs();
        }
        return file.getAbsolutePath();
    }

    public static File getSaveApk(String newVersion){
        String saveApkDir = Utils.getSaveApkDir();
        File file = new File(saveApkDir, newVersion + ".apk");
        return file;
    }
}
