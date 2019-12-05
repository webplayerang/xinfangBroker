import { observable, action, extendObservable } from 'mobx';
import EditReceipt from './EditReceipt';

export default class EditBasicRecognize {
  @observable customerSourceName = '';
  @observable customerSourceId = '';
  @observable dealConfirmUserErpName = ''; // 成交确认人
  @observable dealConfirmUserErpId = '';
  @observable loading = false;
  @observable list = [];

  // 传入初始值
  // constructor(props) {
  //   const data = props || {};
  // }

  // 选择有id和name的
  @action
  changeSelectItem(item) {
    const type = item.type;
    this[`${type}Name`] = item.name;
    this[`${type}Id`] = item.id;
  }
  @action
  setLoading() {
    this.loading = true;
  }
  @action
  cancelLoading() {
    this.loading = false;
  }
  getReceipts(data) {
    if (data.index > -1) {
      this.list[data.index] = data;
    } else {
      this.list.push(data);
    }
  }

  // 后台需要接收的参数
  getFormData() {
    const results = [];
    this.list.forEach((item) => {
      results.push({
        incomePrice: item.incomePrice,
        payAccountName: item.payAccountName,
        noteNumber: item.noteNumber,
        gatheringType: item.gatheringType,
        // businessEntity: item.businessEntity, //泽源 把这个换成businessEntityErpId businessEntityName 2个字段了
        businessEntityErpId: item.businessEntityErpId,
        businessEntityName: item.businessEntityName,
        bankAccountId: item.bankAccountId,
        operatorErpId: item.operatorErpId,
        gatheringDate: item.gatheringDate,
        terminalNumber: item.terminalNumber,
        refNumber: item.refNumber,
        businessNumber: item.businessNumber,
        gatheringBank: item.gatheringBank,
      });
    });
    return results;
  }
}
