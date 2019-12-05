// 上数，转成交共用store
import { observable, action, extendObservable } from 'mobx';
import axios from 'axios';

export default class SubscribeDetail {
  radioServiceTypeOptions = [
    { label: '电商', value: 0 },
    { label: '综合', value: 1 },
  ];
  @observable projectManagerId; // 项目负责人ID
  @observable projectManagerName = ''; // 项目负责人Name
  @observable dealConfirmUserId; // 成交确认人ID
  @observable dealConfirmUserName = ''; // 成交确认人Name
  @observable customerSourceId = ''; // 客户来源ID
  @observable customerSource = ''; // 客户来源
  @observable sourceType = 'RECOGNITION'; // SUBSCRIBE("分销"), RECOGNITION("电商"), COMBINATION("综合");

  constructor(props) {
    if (props) {
      extendObservable(this, props);
    }
  }

  @action
  changeDealConfirmUserName(item) {
    this.dealConfirmUserId = item.id;
    this.dealConfirmUserName = item.name;
  }

  @action
  changeCustomerSource(item) {
    this.customerSourceId = item.id;
    this.customerSource = item.name;
  }

  // 切换业务类型
  /* global requestAnimationFrame */
  //  SUBSCRIBE("分销"), RECOGNITION("电商"), COMBINATION("综合");
  @action
  changeSourceType(value) {
    requestAnimationFrame(() => {
      this.sourceType = value === 0 ? 'RECOGNITION' : 'COMBINATION';
    });
  }


  @action
  async getProjectManager(opts) {
    const person = await axios.get('/common/projectPersons', {
      params: {
        expandId: opts.expandId,
        isManager: opts.isManager,
      },
    }).then((res) => {
      if (res.data.status === 'C0000' && res.data.result.length > 0) {
        return res.data.result[0];
      }
      return {};
    });

    this.projectManagerId = person.id;
    this.projectManagerName = person.name;
  }
}
