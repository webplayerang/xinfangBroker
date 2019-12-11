package com.android.xinfang.bean;

import java.io.Serializable;
import java.util.List;

/**
 * @author wt
 * @Description: 更新
 * @date 2017/11/16 18:05
 */
public class UpdateBean implements Serializable {
    public String newVersion;

    public String downloadUrl;

    public String updateTips; // 更新内容

    public boolean forceUpdate;

    public List<String> updateTipsUrl; // 引导图片

    public boolean needUpdate; // 是否需要更新

    @Override
    public String toString() {
        return "newVersion: " + newVersion + " , forceUpdate: " + forceUpdate + " , needUpdate: " + needUpdate + " , updateTips: " + updateTips;
    }
}
