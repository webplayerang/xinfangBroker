import React, { Component } from 'react';
import {
  StyleSheet,
  Dimensions,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  Platform,
  DeviceEventEmitter,
  InteractionManager,
  FlatList,
} from 'react-native';
import { observer } from 'mobx-react/native';
import { autorun, toJS } from 'mobx';
import RadioForm from 'react-native-simple-radio-button';
import Toast from 'react-native-easy-toast';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from '../../components/Icon/';
import baseStyles from '../../style/BaseStyles';
import ProportionPicker from '../../components/ProportionPicker';
import DistributinStore from '../../stores/Common/Distributin';
// import { screen } from '../../utils';
@observer
export default class Distributin extends Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      title: '分销款分佣信息',
      headerRight: (
        <TouchableOpacity onPress={() => params.saveDistributin()}>
          <Text style={styles.headerRight}>确定</Text>
        </TouchableOpacity>
      ),
    };
  };

  constructor(props) {
    super(props);

    this.scrollRef = null;
    this.renderItem = this.renderItem.bind(this);
  }

  componentWillMount () {
    this.dStore = new DistributinStore();

    const { params } = this.props.navigation.state;
    if (params && params.store) {
      this.dStore.clone(params.store);
    }

    // 可结算佣金变化
    this.distributionSettlementFun = autorun(() => {
      this.dStore.changeListBySettle(this.dStore.distributionSettlement);
    });

    // 总的现金奖变化
    this.distributionCashPrizeFun = autorun(() => {
      this.dStore.changeListByCash(this.dStore.distributionCashPrize);
    });

    // 总的合作佣金变化
    this.distributionCooperativeCommissionFun = autorun(() => {
      this.dStore.changeListByCooperative(this.dStore.distributionCooperativeCommission);
    });
  }

  componentDidMount () {
    ProportionPicker.picker({
      // 监控分配比例组件的值变化，让 dStore 的值相应变化
      onPickerConfirm: () => {
        if (this.currentPicker === 1) {
          this.dStore.changeCooperativeProportion(ProportionPicker.value);
        } else if (this.currentPicker === 2) {
          this.dStore.changeActualProportion(ProportionPicker.value);
        }
        this.dStore.changePickerMaskVisable(false);
      },
      onPickerCancel: () => {
        this.dStore.changePickerMaskVisable(false);
      },
    });

    this.props.navigation.setParams({
      saveDistributin: this.saveDistributin.bind(this),
    });

    this.listener = DeviceEventEmitter.addListener('DistributePicker', (item) => {
      if (item.type === 'DistributePicker') {
        InteractionManager.runAfterInteractions(() => {
          this.dStore.changeDistributionPerson(item, this.index);
        });
      }
    });
  }

  componentWillUnmount () {
    // 防止没有关闭便跳转页面
    ProportionPicker.hide();
    this.listener.remove();
    // if (this.distributionSettlementFun) {
    //   this.distributionSettlementFun.remove();
    // }
    // if (this.distributionCashPrize) {
    //   this.distributionCashPrize.remove();
    // }
    // if (this.distributionCooperativeCommission) {
    //   this.distributionCooperativeCommission.remove();
    // }
  }

  // 保存分销信息
  saveDistributin () {
    const data = this.dStore;
    this.dStore.getDistributionPersonVos();

    if (!data.brokerageProportion) {
      this.toast.show('请输入实际佣金点数!');
      return;
    }

    if (!data.fixedCommission) {
      this.toast.show('请输入定佣!');
      return;
    }

    if (data.hasCashPrize === 0 && !data.cashPrizeAmount) {
      this.toast.show('请输入现金奖!');
      return;
    }

    if (data.hasCooperativeCommission === 0) {
      if (!data.cooperativeCommission) {
        this.toast.show('请输入合作金额!');
        return;
      }
      if (data.cooperativeProportion.length === 0) {
        this.toast.show('请选择合作佣金比例分配!');
        return;
      }
    }

    if (!data.actualCommission || data.actualCommission < 0) {
      this.toast.show('请输入正确的实际佣金!');
      return;
    }

    // 比例分佣
    if (data.actualCommissionMode === 0 && data.actualProportion.length === 0) {
      this.toast.show('请选择佣金比例分配!');
      return;
    }

    // 定额分佣
    if (data.actualCommissionMode === 1 && !data.distributionFixedCommission) {
      this.toast.show('请输入定额分佣!');
      return;
    }

    if (data.projectSettlement < 0) {
      this.toast.show('为负数，请输入正确的分销款!');
      return;
    }

    // if (!data.distributionPersonId) {
    //   this.toast.show('请选择分销人员!');
    //   return;
    // }

    // if (data.distributionSettlement < 0) {
    //   this.toast.show('为负数，请输入正确的分销款!');
    //   return;
    // }

    // 多个分销人员里面的验证
    if (data.validStr) {
      this.toast.show(data.validStr);
      return;
    }

    this.props.navigation.goBack();

    const { params } = this.props.navigation.state;

    if (params && params.store) {
      params.store.clone(this.dStore);
    }

    DeviceEventEmitter.emit('DistributinInfoListener');
  }

  showPicker1 (value) {
    this.currentPicker = 1;
    ProportionPicker.show(value);
    this.dStore.changePickerMaskVisable(true);
  }

  showPicker2 (value) {
    this.currentPicker = 2;
    ProportionPicker.show(value);
    this.dStore.changePickerMaskVisable(true);
  }

  hidePicker () {
    ProportionPicker.hide();
    this.dStore.changePickerMaskVisable(false);
  }

  selectPerson (index) {
    const { navigate } = this.props.navigation;
    const { params } = this.props.navigation.state;
    this.index = index;
    navigate('DistributePicker', {
      title: '人员选择',
      url: '/subscribe/distributionPersons',
      type: 'DistributePicker',
      params: {
        reservationId: params.reservationId,
        pageSize: 30,
      },
      event: 'DistributePicker',
    });
  }

  // dStore = new DistributinStore();
  renderItem (data) {
    const item = data.item;
    const showProportion = this.dStore.list.length > 1;
    // 详情页没有新增和删除
    const isDatail = !!item.distributionIncomeValueId;
    return (
      <View>
        {/* 标题 */}
        <View style={[baseStyles.comTitleOutBox, styles.title]} >
          <View style={[baseStyles.comTitleBox, { justifyContent: 'space-between', flex: 1 }]}>
            <Text style={baseStyles.comTitle}>分销人员佣金分配</Text>

            {
              (data.index > 0 && !isDatail) &&
              <TouchableOpacity
                style={[baseStyles.btnOrange, { backgroundColor: '#e7eae8', borderWidth: 0 }]}
                onPress={() => this.dStore.delItem(data.index)}
              >
                <Text style={[baseStyles.btnOrangeTxt, { color: '#3a3a3a' }]}>删除</Text>
              </TouchableOpacity>
            }

            {
              (data.index === 0 && !isDatail) &&
              <TouchableOpacity
                onPress={() => { this.dStore.addItem(); }}
                style={[baseStyles.btnOrange, { backgroundColor: '#f91', borderWidth: 0 }]}
              >
                <Text style={[baseStyles.btnOrangeTxt, { color: '#fff' }]}>新增</Text>
              </TouchableOpacity>
            }
          </View>
        </View >

        {/* 内容 */}
        {/* 姓名： */}
        <TouchableOpacity onPress={() => this.selectPerson(data.index)}>
          <View style={[styles.formItem, styles.borderBt]}>
            <Text style={styles.paramTxt}>姓名：</Text>
            <View style={styles.selectBox}>
              {
                item.distributionPersonName ?
                  <Text style={styles.selectText}>
                    {item.distributionPersonName}
                  </Text>
                  :
                  <Text style={[styles.selectText, styles.ca8]}>请选择</Text>
              }
            </View>
            <View style={[styles.rightIcon, { paddingRight: 15 }]} ><Icon name="arrow-right" size={16} color="#3a3a3a" /></View>
          </View>
        </TouchableOpacity>

        <View style={styles.rowWithBorder}>
          <Text style={[styles.content, styles.contentLabel]}>可结算佣金 : </Text>
          <Text style={styles.contentRight}>{item.distributionSettlement} 元</Text>
        </View>

        {
          this.dStore.hasCashPrize === 0 &&
          <View style={styles.rowWithBorder}>
            <Text style={[styles.content, styles.contentLabel]}>可结现金奖 : </Text>
            <Text style={styles.contentRight}>{item.distributionCashPrize} 元</Text>
          </View>
        }
        {
          this.dStore.hasCooperativeCommission === 0 &&
          <View style={styles.rowWithBorder}>
            <Text style={[styles.content, styles.contentLabel]}>合作佣金 : </Text>
            <Text style={styles.contentRight}>{item.distributionCooperativeCommission} 元</Text>
          </View>
        }

        {/* 比例 */}
        {
          showProportion &&
          <View style={[styles.borderBt, styles.formItem]}>
            <Text style={styles.paramTxt}>佣金比例：</Text>
            <TextInput
              style={[styles.formInputs, styles.fmPr]}
              value={item.actualProportion}
              placeholder="请输入"
              keyboardType="numeric"
              placeholderTextColor="#a8a8a8"
              underlineColorAndroid="transparent"
              onChangeText={(text) => this.dStore.changeItem(data.index, 'actualProportion', text)}
            />
          </View>
        }

        {/* 现金奖比例 */}
        {
          (this.dStore.hasCashPrize === 0 && showProportion) &&
          <View style={[styles.borderBt, styles.formItem]}>
            <Text style={styles.paramTxt}>现金奖比例：</Text>
            <TextInput
              style={[styles.formInputs, styles.fmPr]}
              placeholder="请输入"
              keyboardType="numeric"
              placeholderTextColor="#a8a8a8"
              underlineColorAndroid="transparent"
              value={item.awardProportion}
              onChangeText={(text) => this.dStore.changeItem(data.index, 'awardProportion', text)}
            />
          </View>
        }

        {/* 合作佣金比例 */}
        {
          (this.dStore.hasCooperativeCommission === 0 && showProportion) &&
          <View style={[styles.borderBt, styles.formItem]}>
            <Text style={styles.paramTxt}>合作佣金比例：</Text>
            <TextInput
              style={[styles.formInputs, styles.fmPr]}
              placeholder="请输入"
              keyboardType="numeric"
              placeholderTextColor="#a8a8a8"
              underlineColorAndroid="transparent"
              value={item.cooperationProportion}
              onChangeText={(text) => this.dStore.changeItem(data.index, 'cooperationProportion', text)}
            />
          </View>
        }
      </View >
    );
  }

  render () {
    const { dStore } = this;
    return (
      <View style={styles.container}>
        <KeyboardAwareScrollView ref={(view) => { this.scrollRef = view; }}>
          <ScrollView>
            <View style={styles.separated} />
            <View style={styles.row}>
              <View style={styles.flag} />
              <Text style={styles.subtitle}>基础信息录入</Text>
            </View>
            <View style={styles.separated} />
            <View style={styles.row}>
              <Text style={styles.totalPriceLabel}>成交总价 : </Text>
              <Text style={styles.totalPrice}>{dStore.totalPrice} 元</Text>
            </View>
            <View style={styles.separated} />
            <View style={styles.rowWithBorder}>
              <Text style={[styles.content, styles.contentLabel]}>实际佣金点数 : </Text>
              <View style={styles.contentValue}>
                <TextInput value={dStore.brokerageProportion} placeholder="请输入" width={80} keyboardType="numeric" onChangeText={(text) => dStore.changeBrokerageProportion(text)} />
                <Text style={styles.contentRight}>{Platform.OS === 'ios' ? ' %' : '%'}</Text>
              </View>
            </View>
            <View style={styles.rowWithBorder}>
              <Text style={[styles.content, styles.contentLabel]}>定佣 : </Text>
              <View style={styles.contentValue}>
                <TextInput value={dStore.fixedCommission} placeholder="请输入" width={80} keyboardType="numeric" onChangeText={(text) => dStore.changeFixedCommission(text)} />
                <Text style={styles.contentRight}>元</Text>
              </View>
            </View>
            <View style={styles.rowWithBorder}>
              <Text style={[styles.content, styles.contentLabel]}>现金奖 : </Text>
              <RadioForm
                style={{ flex: 2, justifyContent: 'space-between' }}
                radio_props={dStore.radioHasPropOptions}
                initial={dStore.hasCashPrize}
                formHorizontal
                buttonColor={'#FFC601'}
                selectedButtonColor={'#FFC601'}
                labelStyle={styles.radioButton}
                buttonSize={13}
                onPress={(value) => { dStore.changeHasCashPrize(value); }}
              />
            </View>
            {
              dStore.hasCashPrize === 0 &&
              <View style={styles.rowWithBorder}>
                <Text style={[styles.content, styles.contentLabel]}>现金奖形式 : </Text>
                <RadioForm
                  style={{ flex: 2, justifyContent: 'space-between' }}
                  radio_props={dStore.radioCashPrizeModeOptions}
                  formHorizontal
                  initial={dStore.cashPrizeMode}
                  buttonColor={'#FFC601'}
                  selectedButtonColor={'#FFC601'}
                  labelStyle={styles.radioButton}
                  buttonSize={13}
                  onPress={(value) => { dStore.changeCashPrizeMode(value); }}
                />
              </View>
            }

            {/* // 分销佣金承担  */}
            {
              // 有现金奖，并且模式为佣金内
              dStore.hasCashPrize === 0 && dStore.cashPrizeMode === 0 ?
                <View style={styles.rowWithBorder}>
                  <Text style={[styles.content, styles.contentLabel]}>分销佣金承担 : </Text>
                  <RadioForm
                    style={{ flex: 2, justifyContent: 'space-between' }}
                    radio_props={dStore.radioDistributionCommissionBearOptions}
                    formHorizontal
                    initial={dStore.distributionCommissionBear}
                    buttonColor={'#FFC601'}
                    selectedButtonColor={'#FFC601'}
                    labelStyle={styles.radioButton}
                    buttonSize={13}
                    onPress={(value) => { dStore.changeDistributionCommissionBear(value); }}
                  />
                </View>
                : null
            }

            {dStore.hasCashPrize === 0 &&
              <View style={styles.rowWithBorder}>
                <Text style={[styles.content, styles.contentLabel]}>现金奖金额 : </Text>
                <View style={styles.contentValue}>
                  <TextInput value={dStore.cashPrizeAmount} placeholder="请输入" width={80} keyboardType="numeric" onChangeText={(text) => dStore.changeCashPrizeAmount(text)} />
                  <Text style={styles.contentRight}>元</Text>
                </View>
              </View>
            }
            <View style={styles.rowWithBorder}>
              <Text style={[styles.content, styles.contentLabel]}>合作佣金 : </Text>
              <RadioForm
                style={{ flex: 2, justifyContent: 'space-between' }}
                radio_props={dStore.radioHasPropOptions}
                initial={dStore.hasCooperativeCommission}
                formHorizontal
                buttonColor={'#FFC601'}
                selectedButtonColor={'#FFC601'}
                labelStyle={styles.radioButton}
                buttonSize={13}
                onPress={(value) => { dStore.changeHasCooperativeCommission(value); }}
              />
            </View>
            {dStore.hasCooperativeCommission === 0 &&
              <View style={styles.rowWithBorder}>
                <Text style={[styles.content, styles.contentLabel]}>合作金额 : </Text>
                <View style={styles.contentValue}>
                  <TextInput value={dStore.cooperativeCommission} placeholder="请输入" width={80} keyboardType="numeric" onChangeText={(text) => dStore.changeCooperativeCommission(text)} />
                  <Text style={styles.contentRight}>元</Text>
                </View>
              </View>
            }
            {dStore.hasCooperativeCommission === 0 &&
              <View style={styles.rowWithBorder}>
                <Text style={[styles.content, styles.contentLabel]}>比例分配(项目:分销): </Text>
                <TouchableOpacity style={[styles.contentValue, { width: 160 }]} onPress={() => this.showPicker1(dStore.cooperativeProportion)}>
                  <TextInput
                    style={[styles.formInput, { width: 130, textAlign: 'right' }]}
                    placeholder="请选择"
                    placeholderTextColor="#a8a8a8"
                    underlineColorAndroid="transparent"
                    editable={false}
                    value={dStore.cooperativeProportion.join(':')}
                  />
                  <View style={styles.rightIcon} ><Icon name="bili" size={16} color="#3a3a3a" /></View>
                </TouchableOpacity>
              </View>
            }
            <View style={styles.rowWithBorder}>
              <Text style={[styles.content, styles.contentLabel]}>实际佣金 : </Text>
              <Text style={styles.contentRight}>{dStore.actualCommission} 元</Text>
            </View>
            <View style={styles.rowWithBorder}>
              <Text style={[styles.content, styles.contentLabel]}>佣金分配方式 : </Text>
              <RadioForm
                style={{ flex: 2, justifyContent: 'space-between' }}
                radio_props={dStore.radioActualCommissionModeOptions}
                initial={dStore.actualCommissionMode}
                formHorizontal
                buttonColor={'#FFC601'}
                selectedButtonColor={'#FFC601'}
                labelStyle={styles.radioButton}
                buttonSize={13}
                onPress={(value) => { dStore.changeActualCommissionMode(value); }}
              />
            </View>
            {dStore.actualCommissionMode === 0 ?
              <View style={styles.rowWithBorder}>
                <Text style={[styles.content, styles.contentLabel]}>比例分配(项目:分销): </Text>
                <TouchableOpacity style={[styles.contentValue, { width: 160 }]} onPress={() => this.showPicker2(dStore.actualProportion)}>
                  <TextInput
                    style={[styles.formInput, { width: 130, textAlign: 'right' }]}
                    placeholder="请选择"
                    placeholderTextColor="#a8a8a8"
                    underlineColorAndroid="transparent"
                    editable={false}
                    value={dStore.actualProportion.join(':')}
                  />
                  <View style={styles.rightIcon} ><Icon name="bili" size={16} color="#3a3a3a" /></View>
                </TouchableOpacity>
              </View>
              :
              <View style={styles.rowWithBorder}>
                <Text style={[styles.content, styles.contentLabel]}>定额佣金(分销): </Text>
                <View style={styles.contentValue}>
                  <TextInput value={dStore.distributionFixedCommission} placeholder="请输入" width={80} keyboardType="numeric" onChangeText={(text) => dStore.changeDistributionFixedCommission(text)} />
                  <Text style={styles.contentRight}>元</Text>
                </View>
              </View>
            }
            <View style={styles.separated} />
            <View style={styles.rowWithButton}>
              <TouchableOpacity style={[styles.button, styles.contentValue]} onPress={() => { this.scrollRef.scrollToEnd(); }}>
                <Icon style={{ marginRight: 5, marginTop: 1 }} name="fangdaijisuanqi" size={22} color="#ffffff" />
                <Text style={styles.buttonText}>查看人员佣金分配</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.separated} />
            <View style={[styles.row, styles.title]}>
              <View style={styles.flag} />
              <Text style={styles.subtitle}>项目人员佣金分配</Text>
            </View>
            <View style={styles.rowWithBorder}>
              <Text style={[styles.content, styles.contentLabel]}>姓名 :</Text>
              <Text style={styles.contentRight}>{dStore.projectPersonName}</Text>
            </View>
            {dStore.hasCooperativeCommission === 0 &&
              <View style={styles.rowWithBorder}>
                <Text style={[styles.content, styles.contentLabel]}>合作佣金（支出）: </Text>
                <Text style={styles.contentRight}>{dStore.projectCooperativeCommission} 元</Text>
              </View>
            }
            <View style={styles.rowWithBorder}>
              <Text style={[styles.content, styles.contentLabel]}>可结算佣金 : </Text>
              <Text style={styles.contentRight}>{dStore.projectSettlement} 元</Text>
            </View>

            {/* // 分销人员佣金分配 */}

            {
              dStore.list.length > 0 &&
              <FlatList
                initialListSize={5}
                data={toJS(dStore.list)}
                renderItem={this.renderItem}
                keyExtractor={(item, index) => index.toString()}
                onViewableItemsChanged={() => {
                  if (dStore.itemFlag && this.scrollRef) {
                    this.scrollRef.scrollToEnd();
                  }
                }}
              />
            }

            {
              dStore.pickerMaskVisable &&
              <TouchableWithoutFeedback onPress={() => this.hidePicker()}>
                <View style={styles.pickerMask} />
              </TouchableWithoutFeedback>
            }
          </ScrollView>
        </KeyboardAwareScrollView>
        <Toast
          ref={(c) => { this.toast = c; }}
          position="center"
          opacity={0.7}
        />
      </View >
    );
  }
}

const styles = StyleSheet.create({
  borderBt: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e7e8ea',
  },
  selectBox: {
    padding: 0,
    margin: 0,
    flex: 1,
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
  },
  selectText: {
    flex: 1,
    fontSize: 16,
    textAlign: 'right',
  },
  ca8: {
    color: '#a8a8a8',
  },
  paramTxt: {
    width: 'auto',
    fontSize: 16,
    color: '#7e7e7e',
  },
  formItem: {
    paddingLeft: 15,
    backgroundColor: '#fff',
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
  },
  formInputs: {
    fontSize: 16,
    padding: 0,
    margin: 0,
    height: '100%',
    flex: 1,
    color: '#3a3a3a',
    textAlign: 'right',
  },
  container: {
    flex: 1,
    backgroundColor: '#F6F5FA',
  },
  fmPr: {
    paddingRight: 15,
  },
  headerRight: {
    marginRight: 15,
    color: '#3A3A3A',
    fontSize: 17,
  },
  title: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e7e8ea', // #e7e8ea
  },
  row: {
    height: 56,
    width: '100%',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    flexDirection: 'row',
  },
  rowWithBorder: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: 15,
    paddingRight: 15,
    height: 55,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e7e8ea',
  },
  rowWithButton: {
    height: 44,
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  separated: {
    height: 10,
    width: '100%',
  },
  subtitle: {
    fontSize: 18,
    color: '#A8A8A8',
    marginLeft: 12,
  },
  flag: {
    backgroundColor: '#FFC601',
    width: 3,
    height: 42,
  },
  content: {
    flex: 1,
  },
  totalPriceLabel: {
    marginLeft: 15,
    fontSize: 17,
    color: '#3A3A3A',
  },
  totalPrice: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FDC800',
  },
  contentLabel: {
    fontSize: 16,
    color: '#7E7E7E',
  },
  contentValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentRight: {
    fontSize: 16,
    color: '#3B3B3B',
  },
  formInput: {
    fontSize: 16,
  },
  button: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF9911',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  radioButton: {
    fontSize: 16,
    width: 80,
  },
  radio: {
    padding: 10,
    borderWidth: 2,
    borderColor: '#FFC601',
    borderRadius: 12,
    marginRight: 10,
  },
  rightIcon: {
    paddingLeft: 5,
  },

  pickerMask: {
    width: Dimensions.get('window').width,
    height: '100%',
    position: 'absolute',
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});
