package com.android.xinfang.constant;

import java.io.File;

/**
 * @author wt
 * @Description: 描述
 * @date 2017/11/17 11:06
 */
public interface AppConstant {
    String DOWNLOAD_APK_DIR = "XinFang" + File.separator + "download" + File.separator;

    interface Update {
        String fileName = "update";
        String keyVersionName = "keyVersionName";
        String keyTotalByte = "keyTotalByte";
    }
}
