import { observable, toJS, action, extendObservable } from 'mobx';

export default class EditReceipts {
  // 以下 1 个为 radio 的选项数据 转账方式 默认pos机
  payTypePropOptions = [
    { label: 'POS机', value: 0 },
    { label: '转账', value: 1 },
  ];

  @observable incomePrice = ''; // 收款金额
  @observable payAccountName = '';// 交款账号名
  @observable noteNumber = '';// 收据号
  @observable gatheringType = 0; // 转账方式 默认pos机
  @observable businessEntityId = '';// 业务实体
  @observable businessEntityName = '';// 业务实体
  @observable terminalNumber = ''; // 终端号
  @observable refNumber = '';// 系统参考号Name
  @observable bankAccountId = '';// 银行账号Id
  @observable bankAccountNumber = '';// 银行账号Number
  @observable posBankAccountId = '';// POS银行账号Id
  @observable posBankAccountNumber = '';// POS银行账号Number
  @observable turnBankAccountId = '';// 转账银行账号Id
  @observable turnBankAccountNumber = '';// 转账银行账号Number
  @observable gatheringBank = '';// 收款银行
  @observable operatorErpId = '';// 经办人ID
  @observable operatorErpName = '';// 经办人Name
  @observable gatheringDate = null; // 收款时间
  @observable businessNumber = ''; // 交易流水号
  @observable gatheringTypeDesc = ''; // 方式
  @observable index = -1;
  @observable loading = false;
  @observable incomeId = '';

  // 传入初始值
  constructor(props) {
    if (props) {
      const navigation = props.navigation || {};
      const { params = {} } = navigation.state;
      const data = params.data || {};
      const item = data.item || {};
      extendObservable(this, item);
      if (item.gatheringType === 'POS') {
        this.gatheringType = 0;
        this.turnBankAccountId = '';
        this.turnBankAccountNumber = '';
        this.posBankAccountId = item.bankAccountId;
        this.posBankAccountNumber = item.bankAccountNumber;
      }
      if (item.gatheringType === 'TRANSFER') {
        this.gatheringType = 1;
        this.posBankAccountId = '';
        this.posBankAccountNumber = '';
        this.turnBankAccountId = item.bankAccountId;
        this.turnBankAccountNumber = item.bankAccountNumber;
      }
      // 编辑有下标
      if (this.incomePrice) {
        this.incomePrice = `${item.incomePrice}`;
      }
      if (item.businessEntity) {
        this.businessEntityId = item.businessEntity;
      }
      this.index = data.index;
      this.operatorErpName = item.operatorName;
    }
  }
  @action
  setLoading() {
    this.loading = true;
  }
  @action
  cancelLoading() {
    this.loading = false;
  }
  // 收款金额
  @action
  changeIncomePrice(text) {
    this.incomePrice = text;
  }

  // 交款账号名
  @action
  changePayAccountName(text) {
    this.payAccountName = text;
  }

  // 收据号
  @action
  changeNote(item) {
    this.noteNumber = item.id;
    // this.noteName = item.bookId;
  }

  // 业务实体
  @action
  changeBusinessEntity(item) {
    this.businessEntityName = item.name;
    this.businessEntityId = item.id;
  }

  /*
    收款方式
    pos选项下终端号，系统参考号，银行账号
    转账选项下 收款银行，银行账号，交易流水号
    pos为0 转账为1
       */
  @action
  changePayType(value) {
    this.gatheringType = value;
  }
  // pos选项
  // 终端号
  @action
  changeTerminalNumber(text) {
    this.terminalNumber = text;
  }
  // 系统参考号
  @action
  changeRefNumber(value) {
    this.refNumber = value;
  }

  // pos银行账号
  @action
  changePosBankAccount(item) {
    this.posBankAccountNumber = item.name;
    this.posBankAccountId = item.id;
    this.bankAccountNumber = item.name;
    this.bankAccountId = item.id;
  }
  // 转账选项
  // 收款银行gatheringBank
  @action
  changeGatheringBank(item) {
    this.gatheringBank = item.name;
    this.gatheringBankId = item.id;
  }

  // 转账银行账号
  @action
  changeTurnBankAccount(item) {
    this.turnBankAccountNumber = item.name;
    this.turnBankAccountId = item.id;
    this.bankAccountNumber = item.name;
    this.bankAccountId = item.id;
  }
  // 交易流水号
  @action
  changeBusinessNumber(text) {
    this.businessNumber = text;
  }

  // 经纪人
  @action
  changeOperator(item) {
    this.operatorErpName = item.name;
    this.operatorErpId = item.id;
  }

  // 选择有id和name的
  @action
  changeSelectItem(item) {
    const type = item.type;
    this[`${type}Name`] = item.name;
    this[`${type}Id`] = item.id;
  }

  // 收款时间
  @action
  changeGatheringDate(text) {
    this.gatheringDate = text;
  }

  // 数据处理
  saveReceipts() {
    const data = toJS(this);
    data.businessEntityErpId = this.businessEntityId;
    data.businessEntityName = this.businessEntityName;
    data.operatorName = this.operatorErpName;
    /*
  收款方式
  pos选项下终端号，系统参考号，银行账号
  转账选项下 收款银行，银行账号，交易流水号
  pos为0 转账为1
     */
    if (this.gatheringType === 0) {
      // pos机 银行账号处理了
      data.terminalNumber = this.terminalNumber;
      data.refNumber = this.refNumber;
      data.businessNumber = '';
      data.gatheringTypeDesc = 'POS机';
      data.gatheringType = 'POS';
    } else {
      data.gatheringTypeDesc = '转账';
      data.gatheringType = 'TRANSFER';
      data.terminalNumber = '';
      data.refNumber = '';
      data.gatheringBank = this.gatheringBank;
      data.businessNumber = this.businessNumber;
    }
    return data;
  }
  getFormData() {
    const item = this.saveReceipts();
    let formData = {};
    formData = {
      incomePrice: item.incomePrice,
      payAccountName: item.payAccountName,
      noteNumber: item.noteNumber,
      gatheringType: item.gatheringType,
      businessEntityErpId: item.businessEntity,
      businessEntityName: item.businessEntityName,
      bankAccountId: item.bankAccountId,
      operatorErpId: item.operatorErpId,
      gatheringDate: item.gatheringDate,
      terminalNumber: item.terminalNumber,
      refNumber: item.refNumber,
      businessNumber: item.businessNumber,
      gatheringBank: item.gatheringBank,
      incomeId: item.incomeId,
    };
    return formData;
  }
  getSendParams(editNeed) {
    const sendParams = {
      customerName: editNeed.customerName,
      customerSource: editNeed.customerSource,
      dealConfirmUserErpId: editNeed.dealConfirmUserErpId,
      recognitionId: editNeed.recognitionId,
      reservationId: editNeed.reservationId,
      incomeBills: editNeed.incomeBills,
    };
    sendParams.incomeBills[this.index] = this.getFormData();
    return sendParams;
  }
}
