import { observable, computed, action, extendObservable, toJS } from 'mobx';

export default class GroupPurchase {
  // 以下 3 个为 radio 的选项数据
  radioHasPropOptions = [
    { label: '有', value: 0 },
    { label: '无', value: 1 },
  ];

  radioCashPrizeModeOptions = [
    { label: '佣金内', value: 0 },
    { label: '佣金外', value: 1 },
  ];

  // 分销佣金承担
  radioDistributionCommissionBearOptions = [
    { label: '是', value: 0 },
    { label: '否', value: 1 },
  ];

  radioActualCommissionModeOptions = [
    { label: '比例分佣', value: 0 },
    { label: '定额分佣', value: 1 },
  ];

  @observable groupPrice = ''; // 团购费
  @observable projectPersonId = undefined; // 项目人员
  @observable projectPersonName = ''; // 项目人员
  @observable distributionPersonId = undefined; // 分销人员
  @observable distributionPersonName = ''; // 分销人员


  @observable hasCashPrize = 1; // 是否有现金奖，0:有, 1:无，根据索引值
  @observable cashPrizeMode = 1; // 现金奖形式  0:佣金内 1:佣金外,
  @observable distributionCommissionBear = 1; // 分销佣金承担 0:是，1:否
  @observable cashPrizeAmount = ''; // 现金奖金额
  @observable hasCooperativeCommission = 1; // 是否有合作佣金，0:有, 1:无，根据索引值
  @observable cooperativeCommission = ''; // 合作金额
  @observable cooperativeProportion = []; // 合作佣金分配比例

  @observable actualCommissionMode = 0; // 实际佣金分配方式
  @observable actualProportion = []; // 实际佣金分配比例
  @observable distributionFixedCommission = ''; // 分销定额佣金

  @observable pickerMaskVisable = false; // 不是表单数据，控制 Picker 的 Mask 显示隐藏
  @observable infoVisable = false; // 不是表单数据，控制信息显示隐藏

  // 编辑用到的 Id
  projectAssignId = undefined;
  projectIncomeValueId = undefined;
  projectSettlementValueIdId = undefined;
  // distributionAssignId = undefined;
  // distributionIncomeValueId = undefined;
  // distributionSettlementValueIdId = undefined;
  groupCommissionId = undefined;
  // 因为开发时还没有接口文档，因此属性名跟接口参数会有异同，并且界面展示方式也有不同，需要一一匹配
  constructor(props) {
    if (props) {
      const voProps = {};
      voProps.groupPrice = `${props.groupPrice || '0'}`; // 团购费
      voProps.hasCashPrize = props.cash ? 0 : 1; // 是否包含现金奖，根据 cash 的值来判断，有值为包含（0）
      voProps.cashPrizeAmount = `${props.cash || '0'}`; // 现金奖
      voProps.cashPrizeMode = props.includeCash === 'YES' ? 0 : 1; // 现金奖形式，YES 为佣金内 (0)
      voProps.distributionCommissionBear = props.distributionCommissionBear === 'YES' ? 0 : 1; // 分销佣金承担，YES 为 "是"

      voProps.hasCooperativeCommission = props.cooperationCommission ? 0 : 1; // 是否有合作佣金
      voProps.cooperativeCommission = `${props.cooperationCommission || '0'}`; // 合作佣金
      voProps.cooperativeProportion = [props.projectCooperationProportion || 0, props.distributionCooperationProportion || 10]; // 合作佣金比例分配
      // voProps.actualCommission = props.actualCommission; // 实际佣金

      voProps.actualCommissionMode = props.commissionAllocation === 'PROPORTION' ? 0 : 1; // 实际佣金分配方式，PROPORTION("比例分佣"), FIXATION("定额分佣");
      voProps.actualProportion = [props.projectProportion || 0, props.distributionProportion || 0]; // 佣金分配比例
      voProps.distributionFixedCommission = `${props.fixedDisCommission || '0'}`; // 定额分佣

      voProps.projectPersonId = props.projectPersonId; // 项目负责人ID
      voProps.projectPersonName = props.projectPersonName; // 项目负责人姓名
      // voProps.distributionSettlement = props.distributionPersonCanSettleCommission; // 分销人员可结算佣金

      // voProps.distributionPersonId = props.distributionPersonId; // 分销人员 ID
      // voProps.distributionPersonName = props.distributionPersonName; // 分销人员姓名
      // voProps.projectSettlement = props.projectPersonCanSettleCommission; // 项目人员可结算佣金
      voProps.infoVisable = props.infoVisable;

      voProps.projectAssignId = props.projectAssignId;
      voProps.projectIncomeValueId = props.projectIncomeValueId;
      voProps.projectSettlementValueIdId = props.projectSettlementValueIdId;
      // voProps.distributionAssignId = props.distributionAssignId;
      // voProps.distributionIncomeValueId = props.distributionIncomeValueId;
      // voProps.distributionSettlementValueIdId = props.distributionSettlementValueIdId;
      voProps.groupCommissionId = props.groupCommissionId;
      // 参数名不对应处理
      voProps.list = [];
      props.distributionPersonVos.forEach((item) => {
        voProps.list.push({
          distributionAssignId: item.distributionAssignId,
          distributionIncomeValueId: item.distributionIncomeValueId,
          distributionSettlementValueIdId: item.distributionIncomeValueId,
          distributionPersonId: item.distributionPersonId,
          distributionPersonName: item.distributionPersonName,
          distributionSettlement: item.distributionPersonCanSettleCommission,
          distributionCooperativeCommission: item.distributionPersonCanSettleCooperation,
          distributionCashPrize: item.distributionPersonCanSettleCash,
          actualProportion: `${item.actualProportion}`, // 佣金比例
          awardProportion: `${item.awardProportion}`, // 现金奖比例
          cooperationProportion: `${item.cooperationProportion}`, // 合作佣金比例
        });
      });
      extendObservable(this, voProps);
    }
  }

  @action
  clone(store) {
    extendObservable(this, toJS(store));
  }

  // 实际佣金 = 团购费 -（佣金内现金奖）-（合作佣金）
  @computed get actualCommission() {
    let tmp = parseFloat(this.groupPrice) || 0;
    if (this.hasCashPrize === 0 && this.cashPrizeMode === 0) {
      tmp -= parseFloat(this.cashPrizeAmount) || 0;
    }
    if (this.hasCooperativeCommission === 0) {
      tmp -= parseFloat(this.cooperativeCommission) || 0;
    }
    return parseFloat(tmp).toFixed(2);
  }

  // 项目人员合作佣金（支出），合作佣金金额*（比例*10%）
  @computed get projectCooperativeCommission() {
    if (this.cooperativeProportion.length === 2) {
      return parseFloat((this.cooperativeCommission || 0) * parseFloat(this.cooperativeProportion[0]) / 10).toFixed(2);
    }
    return 0;
  }

  /* 项目人员可结算佣金
   （比例分佣）
         const all = this.groupPrice
          1.佣金内&&分销佣金承担(否)  公式：【 all - 佣金内&&分销佣金承担(否) 】*（比例分配点数*10%）- 合作佣金
          2.无现金奖， 或(有现金奖且佣金外) 或(佣金内&&分销佣金承担(是))  公式：  all *（比例分配点数*10%）- 合作佣金
   （定额分佣）
          1.佣金内&&分销佣金承担(否)  公式：【 all - 佣金内&&分销佣金承担(否) 】- 定额佣金 - 合作佣金*（比例分配点数*10%）
          2.其他  公式：【 all  】- 定额佣金 - 合作佣金*（比例分配点数*10%）
  */
  @computed get projectSettlement() {
    let tmp = parseFloat(this.groupPrice) || 0;
    if (
      this.hasCashPrize === 0 // 有现金奖，
      && this.cashPrizeMode === 0 // 且为佣金内
      && this.distributionCommissionBear === 1 // 分销佣金承担(否)
    ) {
      tmp -= parseFloat(this.cashPrizeAmount) || 0;
    }
    // 比例分佣
    if (
      this.actualCommissionMode === 0 // 0为比例，1为定佣
      && this.actualProportion.length === 2
    ) {
      return parseFloat((tmp * (parseFloat(this.actualProportion[0]) / 10)) - this.projectCooperativeCommission).toFixed(2);
    }
    // 定额分佣
    return parseFloat(tmp - this.distributionFixedCommission - this.projectCooperativeCommission).toFixed(2);
  }

  // 分销人员合作佣金（支出），合作佣金金额*（比例*10%）
  @computed get distributionCooperativeCommission() {
    if (this.cooperativeProportion.length === 2) {
      return parseFloat((this.cooperativeCommission || 0) * parseFloat(this.cooperativeProportion[1]) / 10).toFixed(2);
    }
    return 0;
  }

  /* 分销人员可结算佣金
 （比例分佣）
      const all = this.groupPrice
      1.佣金内&&分销佣金承担(否)  公式：【 all - 佣金内&&分销佣金承担(否) 】*（比例分配点数*10%）- 合作佣金
      2.佣金内&&分销佣金承担(是)   公式：   all * 比例佣金 - 总佣内且分销承担现金奖   - 合作佣金*点数
      3.无现金奖， 或(有现金奖且佣金外)  公式：  all *（比例分配点数*10%）- 合作佣金

 （定额分佣）
      1.无现金奖， 或(有现金奖且佣金外) 或(佣金内&&分销佣金承担(否)) 公式： 定额佣金 - 合作佣金*（比例分配点数*10%）
      2.佣金内&&分销佣金承担(是)  公式： 定额佣金 - 佣金内&&分销佣金承担(否) - 合作佣金*（比例分配点数*10%）
  */
  @computed get distributionSettlement() {
    let tmp = parseFloat(this.groupPrice) || 0;

    // if (this.hasCashPrize === 0 && this.cashPrizeMode === 0) {
    //   tmp -= parseFloat(this.cashPrizeAmount) || 0;
    // }
    // 比例分佣
    if (
      this.actualCommissionMode === 0 // 0为比例，1为定佣
      && this.actualProportion.length === 2 // example [2,8] 2 8 分
    ) {
      if (
        this.hasCashPrize === 0 // 有现金奖，
        && this.cashPrizeMode === 0 // 且为佣金内
      ) {
        let exceptCooperativeCommissionAll = 0; // 除合作佣金之外的总数
        // 分销佣金承担(否)
        if (this.distributionCommissionBear === 1) {
          tmp -= parseFloat(this.cashPrizeAmount) || 0;
          exceptCooperativeCommissionAll = tmp * (parseFloat(this.actualProportion[1]) / 10);
        }

        // 分销佣金承担(是)
        if (this.distributionCommissionBear === 0) {
          exceptCooperativeCommissionAll = tmp * (parseFloat(this.actualProportion[1]) / 10);
          exceptCooperativeCommissionAll -= parseFloat(this.cashPrizeAmount) || 0;
        }
        return parseFloat(exceptCooperativeCommissionAll - this.distributionCooperativeCommission).toFixed(2);
      }

      // 无现金奖， 或(有现金奖且佣金外)
      return parseFloat((tmp * (parseFloat(this.actualProportion[1]) / 10)) - this.distributionCooperativeCommission).toFixed(2);
    }

    // 定额分佣
    if (this.actualCommissionMode === 1 // 0为比例，1为定佣
    ) {
      let cashPrize = 0; // 是否需要减去现金奖
      if (
        this.hasCashPrize === 0 // 有现金奖，
        && this.cashPrizeMode === 0 // 且为佣金内
        && this.distributionCommissionBear === 0// 佣金内&&分销佣金承担(是)
      ) {
        cashPrize = parseFloat(this.cashPrizeAmount);
      }
      return parseFloat(this.distributionFixedCommission - cashPrize - this.distributionCooperativeCommission).toFixed(2);
    }

    return 0;
  }

  // 分销人员可结现金奖，公式：直接调用现金奖金额
  @computed get distributionCashPrize() {
    return this.cashPrizeAmount;
  }

  // 默认2个小数，传值位数num则按传入的位数处理
  keepFloat(text, num) {
    let obj = text.replace(/[^\d.]/g, ''); // 清除“数字”和“.”以外的字符
    obj = obj.replace(/^\./g, ''); // 必须保证第一位为数字而不是.
    obj = obj.replace(/\.{2,}/g, '.'); // 只保留第一个. 清除多余的
    obj = obj.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.'); // 保证.只出现一次，而不能出现两次以上
    if (num === 1) {
      obj = obj.replace(/^(\d+)\.(\d).*$/, '$1.$2');// 只能输入1个小数
    }
    obj = obj.replace(/^(\d+)\.(\d\d).*$/, '$1.$2');// 只能输入2个小数
    if (obj.indexOf('.') < 0 && obj !== '') { // 以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
      obj = `${parseFloat(obj)}`;
    }
    return obj;
  }

  // 切换是否有现金奖 // 是否有现金奖，0:有, 1:无
  /* global requestAnimationFrame */
  @action
  changeHasCashPrize(value) {
    requestAnimationFrame(() => {
      this.hasCashPrize = value;
      if (value) {
        this.cashPrizeAmount = '';
      }
    });
  }

  // 切换现金形式：内、外  // 现金奖形式 1:佣金外, 0:佣金内
  /* global requestAnimationFrame */
  @action
  changeCashPrizeMode(value) {
    requestAnimationFrame(() => {
      this.cashPrizeMode = value;
    });
  }

  // 切换 分销佣金承担：是、否 // 分销佣金承担 0:是，1:否
  /* global requestAnimationFrame */
  @action
  changeDistributionCommissionBear(value) {
    requestAnimationFrame(() => {
      this.distributionCommissionBear = value;
    });
  }

  // 修改现金奖金额
  @action
  changeCashPrizeAmount(text) {
    this.cashPrizeAmount = this.keepFloat(text);
  }

  // 切换是否有合作佣金
  /* global requestAnimationFrame */
  @action
  changeHasCooperativeCommission(value) {
    requestAnimationFrame(() => {
      this.hasCooperativeCommission = value;
      if (value === 0) {
        this.cooperativeCommission = '';
      }
    });
  }

  // 修改合作佣金数值
  @action
  changeCooperativeCommission(text) {
    this.cooperativeCommission = this.keepFloat(text);
  }

  // 修改合作佣金分配比例
  @action
  changeCooperativeProportion(arr) {
    this.cooperativeProportion = arr;
  }

  // 修改实际佣金分配方式
  /* global requestAnimationFrame */
  @action
  changeActualCommissionMode(value) {
    requestAnimationFrame(() => {
      this.actualCommissionMode = value;
      if (value === 0) {
        this.distributionFixedCommission = '';
      }
    });
  }

  // 修改实际佣金分配比例
  @action
  changeActualProportion(arr) {
    this.actualProportion = arr;
  }

  @action
  changeDistributionFixedCommission(text) {
    this.distributionFixedCommission = this.keepFloat(text);
  }

  @action
  changePickerMaskVisable(status) {
    this.pickerMaskVisable = status;
  }

  // 修改团购费
  @action
  changeGroupPrice(groupPrice) {
    this.groupPrice = groupPrice;
  }

  // 修改项目人
  @action
  changeProjectPerson(person) {
    this.projectPersonId = person.projectPersonId;
    this.projectPersonName = person.projectPersonName;
  }

  @action
  setInfoVisable(value) {
    this.infoVisable = value;
  }

  // 因为开发时还没有接口文档，因此属性名跟接口参数会有异同，并且界面展示方式也有不同，需要一一匹配
  buildFormData() {
    return {
      groupPrice: this.groupPrice || 0, // 团购费
      cash: this.cashPrizeAmount || 0, // 现金奖
      includeCash: (this.cashPrizeAmount && this.cashPrizeMode === 0) ? 'YES' : 'NO', // 其实是佣金内还是佣金外，默认传佣金外 NO
      distributionCommissionBear: (this.cashPrizeAmount && this.cashPrizeMode === 0 && this.distributionCommissionBear === 0) ? 'YES' : 'NO', // 分销佣金承担，默认传佣金外 NO

      cooperationCommission: this.cooperativeCommission || 0, // 合作佣金
      projectCooperationProportion: this.cooperativeProportion[0], // 合作佣金比例分配，项目的比例数
      distributionCooperationProportion: this.cooperativeProportion[1] || 10, // 合作佣金比例分配，分销的比例数

      actualCommission: this.actualCommission || 0, // 实际佣金
      commissionAllocation: this.actualCommissionMode === 0 ? 'PROPORTION' : 'FIXATION', // 实际佣金分配方式 PROPORTION("比例分佣"), FIXATION("定额分佣");
      // commissionAllocationDesc: this.actualCommissionMode === 0 ? '比例分佣' : '定额分佣', // 实际佣金分配方式 PROPORTION("比例分佣"), FIXATION("定额分佣");

      projectProportion: this.actualProportion[0], // 佣金分配比例，项目的比例数
      distributionProportion: this.actualProportion[1] || 0, // 佣金分配比例，分销的比例数
      fixedDisCommission: this.distributionFixedCommission || 0, // 定额分佣

      projectPersonId: this.projectPersonId, // 项目负责人ID
      projectPersonName: this.projectPersonName, // 项目负责人姓名
      // distributionPersonCanSettleCommission: this.distributionSettlement || 0, // 分销人员可结算佣金

      // distributionPersonId: this.distributionPersonId, // 分销人员 ID
      // distributionPersonName: this.distributionPersonName, // 分销人员姓名
      projectPersonCanSettleCommission: this.projectSettlement || 0, // 项目人员可结算佣金

      projectAssignId: this.projectAssignId,
      projectIncomeValueId: this.projectIncomeValueId,
      projectSettlementValueIdId: this.projectSettlementValueIdId,
      // distributionAssignId: this.distributionAssignId,
      // distributionIncomeValueId: this.distributionIncomeValueId,
      // distributionSettlementValueIdId: this.distributionSettlementValueIdId,
      groupCommissionId: this.groupCommissionId,
      distributionPersonVos: this.getDistributionPersonVos() || [],
    };
  }
  // 对多个分销人员处理
  @observable validStr = '';
  @observable itemFlag = false;
  @observable list = [{
    distributionAssignId: undefined,
    distributionIncomeValueId: undefined,
    distributionSettlementValueIdId: undefined,
    distributionPersonId: undefined,
    distributionPersonName: '',
    distributionSettlement: '0',
    distributionCashPrize: '0',
    distributionCooperativeCommission: '0',
    actualProportion: '10',
    awardProportion: '10',
    cooperationProportion: '10',
  }]; // 分销人员佣金，比例等数据
  // 修改分销人时 多个分销人员数组要变
  @action
  changeDistributionPerson(item, index) {
    // 第一次渲染页面没有index 默认值在上述页面调用了此方法
    if (!index) {
      this.list[0].distributionPersonName = item.personName;
      this.list[0].distributionPersonId = item.personId;
      return;
    }
    this.list[index].distributionPersonName = item.personName;
    this.list[index].distributionPersonId = item.personId;
  }
  // 新增
  // distributionPersonVos.distributionAssignId 人员记录id
  // distributionPersonVos.distributionIncomeValueId 分销人员已收佣金
  // distributionPersonVos.distributionSettlementValueIdId 分销人员已结佣金
  // distributionPersonVos.distributionPersonId 分销人员ID
  // distributionPersonVos.distributionPersonName 分销人员名称
  //  distributionPersonVos.distributionPersonCanSettleCommission 分销人员可结算佣金
  // distributionPersonVos.distributionPersonCanSettleCooperation 分销人员可结算合作佣金
  // distributionPersonVos.distributionPersonCanSettleCash 分销人员可结算现金奖
  // actualProportion       佣金比例
  // cooperationProportion  合作佣金比例
  // awardProportion       现金奖比例
  @action
  addItem() {
    this.itemFlag = true;
    this.list.push({
      distributionAssignId: undefined,
      distributionIncomeValueId: undefined,
      distributionSettlementValueIdId: undefined,
      distributionPersonName: '',
      distributionSettlement: 0,
      distributionCashPrize: 0,
      distributionCooperativeCommission: 0,
      actualProportion: null,
      awardProportion: null,
      cooperationProportion: null,
    });
  }
  // 删除
  @action
  delItem(index) {
    this.itemFlag = true;
    this.list.splice(index, 1);
    // 删除的只剩最后1个
    if (this.list.length === 1) {
      this.list[0].actualProportion = '10';
      this.list[0].awardProportion = '10';
      this.list[0].cooperationProportion = '10';
      this.list[0].distributionSettlement = this.distributionSettlement;
      this.list[0].distributionCashPrize = this.distributionCashPrize;
      this.list[0].distributionCooperativeCommission = this.distributionCooperativeCommission;
    }
  }
  @action
  changeItem(index, key, value) {
    const item = this.list[index];
    switch (key) {
      case 'actualProportion':
        item.actualProportion = this.keepFloat(value, 1);
        item.distributionSettlement = this.distributionSettlement * (item.actualProportion) / 10;
        break;
      case 'awardProportion':
        item.awardProportion = this.keepFloat(value, 1);
        item.distributionCashPrize = this.distributionCashPrize * (item.awardProportion) / 10;
        break;
      case 'cooperationProportion':
        item.cooperationProportion = this.keepFloat(value, 1);
        item.distributionCooperativeCommission = this.distributionCooperativeCommission * (item.cooperationProportion) / 10;
        break;
      default:
        break;
    }
  }
  // 当上面的操作改变总的可结算佣金时
  @action
  changeListBySettle(value) {
    if (this.list.length === 0) {
      return;
    }
    this.list.forEach((item) => {
      item.distributionSettlement = value * item.actualProportion / 10;
    });
  }

  // 当上面的操作改变总的可现金奖
  @action
  changeListByCash(value) {
    if (this.list.length === 0) {
      return;
    }
    this.list.forEach((item) => {
      item.distributionCashPrize = value * item.awardProportion / 10;
    });
  }

  // 当上面的操作改变总的可合作佣金时
  @action
  changeListByCooperative(value) {
    if (this.list.length === 0) {
      return;
    }
    this.list.forEach((item) => {
      item.distributionCooperativeCommission = value * item.cooperationProportion / 10;
    });
  }

  // 后台需要接收的分销参数
  getDistributionPersonVos() {
    const results = [];
    this.validStr = '';
    let actualProportionTotal = 0;
    let awardProportionTotal = 0;
    let cooperationProportionTotal = 0;
    this.list.forEach((item) => {
      if (!item.distributionPersonId) {
        this.validStr = '请选择分销人员！';
        return false;
      }
      if (!parseFloat(item.actualProportion)) {
        this.validStr = '佣金比例必须相加等于10！';
        return false;
      }
      // 有现金奖时
      if (this.hasCashPrize === 0) {
        if (!parseFloat(item.awardProportion)) {
          this.validStr = '现金奖比例必须相加等于10！';
          return false;
        }
      }
      // 这样改到了默认的list数组
      // else {
      //   item.awardProportion = '0';
      //   item.distributionCashPrize = 0;
      // }
      // 有合作佣金时
      if (this.hasCooperativeCommission === 0) {
        if (!parseFloat(item.cooperationProportion)) {
          this.validStr = '合作佣金比例必须相加等于10！';
          return false;
        }
      }
      // 这样改到了默认的list数组
      // else {
      // //   item.cooperationProportion = '0';
      // //   item.distributionCooperativeCommission = 0;
      // // }
      if (item.distributionSettlement < 0 || (this.hasCashPrize === 0 && item.distributionCashPrize < 0)
        || (this.hasCooperativeCommission === 0 && item.cooperationProportion < 0)) {
        this.validStr = '为负数，请输入正确的分销款!';
        return false;
      }
      actualProportionTotal += parseFloat(item.actualProportion);
      awardProportionTotal += parseFloat(item.awardProportion);
      cooperationProportionTotal += parseFloat(item.cooperationProportion);
      results.push({
        distributionAssignId: item.distributionAssignId,
        distributionIncomeValueId: item.distributionIncomeValueId,
        distributionSettlementValueIdId: item.distributionIncomeValueId,
        distributionPersonId: item.distributionPersonId,
        distributionPersonName: item.distributionPersonName,
        distributionPersonCanSettleCommission: item.distributionSettlement,
        distributionPersonCanSettleCooperation: this.hasCooperativeCommission === 0 ? item.distributionCooperativeCommission : 0,
        distributionPersonCanSettleCash: this.hasCashPrize === 0 ? item.distributionCashPrize : 0,
        actualProportion: item.actualProportion, // 佣金比例
        awardProportion: this.hasCashPrize === 0 ? item.awardProportion : 0, // 现金奖比例
        cooperationProportion: this.hasCooperativeCommission === 0 ? item.cooperationProportion : 0, // 合作佣金比例
      });
    });
    if (this.validStr) {
      return false;
    }
    if (actualProportionTotal !== 10) {
      this.validStr = '佣金比例必须相加等于10！';
      return false;
    }
    if (this.hasCashPrize === 0 && awardProportionTotal !== 10) {
      this.validStr = '现金奖比例必须相加等于10！';
      return false;
    }
    if (this.hasCooperativeCommission === 0 && cooperationProportionTotal !== 10) {
      this.validStr = '合作佣金比例必须相加等于10！';
      return false;
    }
    return results;
  }
}

