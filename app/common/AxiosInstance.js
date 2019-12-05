import axios from 'axios';
import { DeviceEventEmitter } from 'react-native';

let myRequester = null;
let myResponser = null;
const instance = axios.create({
  baseURL: 'http://xferp.qfang.com/xfang-trade/',
  // baseURL: 'http://172.16.72.47/xfang-trade/',
});

function changeDefaultParams(params) {
  instance.defaults.params = params;
}

function initInterceptors() {
  // 确保重新初始化拦截器之前，生成全新的promise对象
  const source = axios.CancelToken.source();

  // 重新初始化拦截器之前，先移除旧的拦截器
  if (myRequester !== null && myResponser !== null) {
    instance.interceptors.request.eject(myRequester);
    instance.interceptors.response.eject(myResponser);
  }

  // 添加请求拦截器
  myRequester = instance.interceptors.request.use(
    (config) => {
      // 在发送请求之前，加入 cancelToke，以备后续中止请求
      const cfg = config;

      // 在搜索组件为了取消快速输入的无意义请求，已经增加了cancelToken参数，全局的cancelToken不应该重新定义
      if (!cfg.cancelToken) {
        cfg.cancelToken = source.token;
      }
      // cfg.source 在搜索组件使用时，session失效了 还可以全局拦截到
      cfg.source = source;
      return cfg;
    },
    (error) => {
      // 请求错误时
      Promise.reject(error);
    },
  );

  // 添加响应拦截器
  myResponser = instance.interceptors.response.use(
    (res) => {
      console.log(`ERP--url=${res.request.responseURL}`, res);

      // 对响应数据进行判断用户是否有效
      if (
        res.data.status === 'E0009' || // sesssion 无效
        res.data.status === 'E0004' || // 无权访问
        res.data.status === 'INFO18' || // 用户信息不存在
        res.data.status === 'INFO02'
      ) {
        // 经纪人未同步账号平台
        res.config.source.cancel(`中止请求，原因：${res.data.message}`);
        // 退出到登录界面
        DeviceEventEmitter.emit('Logout');
        return Promise.reject(res.data.message);
      }
      return res;
    },
    (error) => {
      // 响应错误时
      console.log('response error=', error.request, error.response);
      return Promise.reject(error);
    },
  );
}

// initInterceptors();
export default {
  instance,
  changeDefaultParams,
};
