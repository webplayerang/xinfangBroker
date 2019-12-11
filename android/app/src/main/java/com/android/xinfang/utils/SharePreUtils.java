package com.android.xinfang.utils;

import android.content.Context;
import android.content.SharedPreferences;
import android.support.v4.content.SharedPreferencesCompat;

import com.android.xinfang.MainApplication;

/**
 * @author wt
 * @Description: 描述
 * @date 2017/11/17 10:31
 */
public class SharePreUtils {

    public static void set(String prefName, String key, int value) {
        SharedPreferences.Editor editor = getPreferences(prefName).edit();
        editor.putInt(key, value);
        SharedPreferencesCompat.EditorCompat.getInstance().apply(editor);
    }

    public static void set(String prefName, String key, boolean value) {
        SharedPreferences.Editor editor = getPreferences(prefName).edit();
        editor.putBoolean(key, value);
        SharedPreferencesCompat.EditorCompat.getInstance().apply(editor);
    }

    public static void set(String prefName, String key, String value) {
        SharedPreferences.Editor editor = getPreferences(prefName).edit();
        editor.putString(key, value);
        SharedPreferencesCompat.EditorCompat.getInstance().apply(editor);
    }

    public static boolean get(String prefName, String key, boolean defValue) {
        return getPreferences(prefName).getBoolean(key, defValue);
    }

    public static String get(String prefName, String key, String defValue) {
        return getPreferences(prefName).getString(key, defValue);
    }

    public static int get(String prefName, String key, int defValue) {
        return getPreferences(prefName).getInt(key, defValue);
    }

    public static SharedPreferences getPreferences(String prefName) {
        return MainApplication.getContext().getSharedPreferences(prefName, Context.MODE_PRIVATE);
    }
}
