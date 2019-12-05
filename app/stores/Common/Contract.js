// 合同store
import { observable, action, runInAction, toJS, extendObservable } from 'mobx';
import axios from 'axios';
import { getDaysInOneMonth } from '../../utils/tool';

export default class Contract {
  @observable dealCustomerId = undefined; // 成交客户 ID
  @observable dealCustomerName = ''; // 成交客户
  @observable dealCustomerPhone = ''; // 联系方式
  @observable payTypeId = undefined; // 付款方式ID
  @observable payTypeValue = '';
  @observable createDate = ''; // 签约日期
  @observable buyDate = ''; // 认购日期
  @observable roomId = undefined; // 房号ID
  @observable roomNumber = ''; // 房号Number
  @observable roomId = undefined; // 房号ID
  @observable roomDesc = ''; // 房号Number
  @observable area = 0; // 面积
  @observable totalPrice = ''; // 成交总价
  @observable isShow = false; // 是否显示视图
  @observable minDate = ''; // 认购日期最小值
  @observable maxDate = ''; // 认购日期最大值

  constructor(props) {
    if (props) {
      if (this.area !== 0) {
        this.area = `${props.area}`;
      }
      props.totalPrice += '';
      extendObservable(this, props);
    }
  }

  @action
  changeDealCustomerName(text) {
    this.dealCustomerName = text;
  }

  @action
  changeDealCustomerPhone(text) {
    this.dealCustomerPhone = this.keepPhone(text);
  }

  @action
  changePayType(item) {
    this.payTypeId = item.id;
    this.payTypeValue = item.name;
  }

  @action
  changeCreateDate(text) {
    this.createDate = text;
  }

  @action
  changeBuyDate(text) {
    this.buyDate = text;
  }

  @action
  requestDate(expandId) {
    axios
      .get('/common/getBuyDateInterval', {
        params: { expandId },
      })
      .then((res) => {
        runInAction(() => {
          if (res.data.status === 'C0000' && res.data.result.length > 0) {
            this.minDate = res.data.result[0];
            this.maxDate = res.data.result[1];
          } else {
            this.minDate = getDaysInOneMonth('min');
            this.maxDate = getDaysInOneMonth();
          }
        });
      })
      .catch(() => {
        runInAction(() => {
          this.minDate = getDaysInOneMonth('min');
          this.maxDate = getDaysInOneMonth();
        });
      });
  }

  @action
  changeRoom(item) {
    this.roomId = item.roomId;
    this.roomNumber = item.roomNumber;
    this.roomDesc = item.desc;
  }

  @action
  changeArea(text) {
    this.area = this.keepFloat(text);
  }

  @action
  changeTotalPrice(text) {
    this.totalPrice = this.keepFloat(text);
  }

  saveContract() {
    const data = toJS(this);
    return data;
  }

  @action
  setContractInfo(data) {
    extendObservable(this, data);
    this.isShow = true;
  }

  keepFloat(text) {
    let obj = text.replace(/[^\d.]/g, ''); // 清除“数字”和“.”以外的字符
    obj = obj.replace(/^\./g, ''); // 必须保证第一位为数字而不是.
    obj = obj.replace(/\.{2,}/g, '.'); // 只保留第一个. 清除多余的
    obj = obj
      .replace('.', '$#$')
      .replace(/\./g, '')
      .replace('$#$', '.'); // 保证.只出现一次，而不能出现两次以上
    obj = obj.replace(/^(\d+)\.(\d\d).*$/, '$1.$2'); // 只能输入两个小数
    if (obj.indexOf('.') < 0 && obj !== '') {
      // 以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
      obj = `${parseFloat(obj)}`;
    }
    return obj;
  }

  keepPhone(text) {
    return text.replace(/[^\d]/g, ''); // 清除“数字”以外的字符
  }
}
