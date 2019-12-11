package com.android.xinfang.dialog;

import android.os.Bundle;
import android.support.annotation.Nullable;
import android.support.v4.app.DialogFragment;
import android.support.v4.app.FragmentActivity;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import com.android.xinfang.R;

/**
 * @author wt
 * @Description: 更新用对话框
 * @date 2017/11/20 9:36
 */
public class UpdateDialogFragment extends DialogFragment implements View.OnClickListener {

    private View mRootView;
    private TextView mCancelTv;
    private TextView mConfirmTv;
    private TextView mTipTv;
    private TextView mMsgTv;

    private String msg;
    private boolean alreadyDownload;
    private boolean forceUpdate;

    private DialogEventInterface mInterface;


    public static UpdateDialogFragment newInstance(String msg, boolean alreadyDownload, boolean forceUpdate) {
        UpdateDialogFragment fragment = new UpdateDialogFragment();
        Bundle args = new Bundle();
        args.putString("msg", msg);
        args.putBoolean("download", alreadyDownload);
        args.putBoolean("forceUpdate", forceUpdate);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setStyle(DialogFragment.STYLE_NO_TITLE, R.style.CustomDialog);

        Bundle arguments = getArguments();
        msg = arguments.getString("msg");
        alreadyDownload = arguments.getBoolean("download");
        forceUpdate = arguments.getBoolean("forceUpdate");
    }

    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        if (null != mRootView) {
            ViewGroup parent = (ViewGroup) mRootView.getParent();
            if (null != parent) {
                parent.removeView(mRootView);
            }
        } else {
            mRootView = inflater.inflate(R.layout.dialog_update, container, false);
            initView();
        }
        getDialog().setCanceledOnTouchOutside(!forceUpdate);
        return mRootView;
    }

    @Override
    public void onActivityCreated(Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);
        FragmentActivity activity = getActivity();
        if (activity instanceof DialogEventInterface) {
            mInterface = (DialogEventInterface) activity;
        }
    }

    private void initView() {
        mCancelTv = (TextView) mRootView.findViewById(R.id.cancel_btn);
        mConfirmTv = (TextView) mRootView.findViewById(R.id.confirm_btn);
        mTipTv = (TextView) mRootView.findViewById(R.id.tip_tv);
        mMsgTv = (TextView) mRootView.findViewById(R.id.msg_tv);

        if (alreadyDownload) {
            mTipTv.setVisibility(View.VISIBLE);
            mConfirmTv.setText("立即安装");
        } else {
            mTipTv.setVisibility(View.GONE);
            mConfirmTv.setText("立即更新");
        }
        if (!TextUtils.isEmpty(msg)) {
            mMsgTv.setText(msg);
        }

        if (forceUpdate) {
            mCancelTv.setVisibility(View.GONE);
        } else {
            mCancelTv.setVisibility(View.VISIBLE);
        }

        mCancelTv.setOnClickListener(this);
        mConfirmTv.setOnClickListener(this);
    }

    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.cancel_btn:
                if (null == mInterface) {
                    return;
                }
                mInterface.cancel();
                dismiss();
                break;
            case R.id.confirm_btn:
                if (null == mInterface) {
                    return;
                }
                mInterface.confirm();
                dismiss();
                break;
            default:
                break;
        }
    }
}
