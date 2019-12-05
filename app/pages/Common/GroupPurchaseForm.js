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
import GroupPurchaseStore from '../../stores/Common/GroupPurchase';

@observer
export default class GroupPurchase extends Component {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerTintColor: '#3A3A3A',
      title: '团购费分佣信息',
      headerTitleStyle: {
        ...Platform.select({
          android: {
            fontSize: 20,
            alignSelf: 'center',
            // marginLeft: -40, // 返回按钮定义的宽度
          },
          ios: {
            fontSize: 18,
          },
        }),
        fontWeight: 'normal',
      },
      headerRight: <TouchableOpacity onPress={() => params.saveGroupPurchase()}><Text style={styles.headerRight}>确定</Text></TouchableOpacity>,
    };
  };

  constructor() {
    super();
    this.renderItem = this.renderItem.bind(this);
  }

  componentWillMount () {
    this.dStore = new GroupPurchaseStore();
    if (this.props.navigation.state.params && this.props.navigation.state.params.store) {
      this.dStore.clone(this.props.navigation.state.params.store);
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
      saveGroupPurchase: this.saveGroupPurchase.bind(this),
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
  }

  // 保存分销信息
  saveGroupPurchase () {
    const data = this.dStore;
    this.dStore.getDistributionPersonVos();
    if (!data.groupPrice) {
      this.toast.show('请输入团购费!');
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

    if (data.actualCommissionMode === 0) {
      // 比例分佣
      if (data.actualProportion.length === 0) {
        this.toast.show('请选择佣金比例分配!');
        return;
      }
    } else {
      // 定额分佣
      if (!data.distributionFixedCommission) {
        this.toast.show('请输入定额分佣!');
        return;
      }
    }

    // if (!data.distributionPersonId) {
    //   this.toast.show('请选择分销人员!');
    //   return;
    // }
    // 多个分销人员里面的验证
    if (data.validStr) {
      this.toast.show(data.validStr);
      return;
    }
    this.props.navigation.goBack();
    if (this.props.navigation.state.params && this.props.navigation.state.params.store) {
      this.props.navigation.state.params.store.clone(this.dStore);
    }
    DeviceEventEmitter.emit('GroupPurchaseInfoListener');
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
  renderItem (data) {
    const item = data.item;
    const showProportion = this.dStore.list.length > 1;
    // 详情页没有新增和删除
    const isDatail = !!item.distributionIncomeValueId;
    return (
      <View>
        {/* 标题 */}
        <View style={[baseStyles.comTitleOutBox, styles.title]} >
          <View style={[baseStyles.comTitleBox, {
            justifyContent: 'space-between',
            flex: 1,
          }]}
          >
            {/* //this.refs.scrollView.scrollToEnd(); */}
            <View><Text style={baseStyles.comTitle}>分销人员佣金分配</Text></View>
            {(data.index > 0 && !isDatail) &&
              <TouchableOpacity onPress={() => this.dStore.delItem(data.index)}>
                <View style={[baseStyles.btnOrange, {
                  backgroundColor: '#e7eae8',
                  borderWidth: 0,
                }]}
                ><Text style={[baseStyles.btnOrangeTxt, { color: '#3a3a3a' }]}>删除</Text></View>
              </TouchableOpacity>
            }
            {
              (data.index === 0 && !isDatail) &&
              <TouchableOpacity onPress={() => { this.dStore.addItem(); }}>
                <View style={[baseStyles.btnOrange, {
                  backgroundColor: '#f91',
                  borderWidth: 0,
                }]}
                ><Text style={[baseStyles.btnOrangeTxt, { color: '#fff' }]}>新增</Text></View>
              </TouchableOpacity>
            }
          </View>
        </View >
        {/* 标题 */}
        <TouchableOpacity onPress={() => this.selectPerson(data.index)}>
          <View style={[styles.formItem, styles.borderBt]}>
            <Text style={styles.paramTxt}>姓名：</Text>
            <View style={styles.selectBox}>
              {item.distributionPersonName ?
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

            <View style={styles.rowWithBorder}>
              <Text style={[styles.content, styles.contentLabel]}>团购费 : </Text>
              <View style={styles.contentValue}>
                <TextInput
                  value={this.dStore.groupPrice}
                  underlineColorAndroid="transparent"
                  placeholder="请输入"
                  width={90}
                  keyboardType="numeric"
                  onChangeText={(text) => this.dStore.changeGroupPrice(text)}
                />
                <Text style={styles.contentRight}>元</Text>
              </View>
            </View>

            <View style={styles.rowWithBorder}>
              <Text style={[styles.content, styles.contentLabel]}>现金奖 : </Text>
              <RadioForm
                style={{ flex: 2, justifyContent: 'space-between' }}
                radio_props={this.dStore.radioHasPropOptions}
                initial={this.dStore.hasCashPrize}
                formHorizontal
                buttonColor={'#FFC601'}
                selectedButtonColor={'#FFC601'}
                labelStyle={styles.radioButton}
                buttonSize={13}
                onPress={(value) => { this.dStore.changeHasCashPrize(value); }}
              />
            </View>

            {
              this.dStore.hasCashPrize === 0 &&
              <View style={styles.rowWithBorder}>
                <Text style={[styles.content, styles.contentLabel]}>现金奖形式 : </Text>
                <RadioForm
                  style={{ flex: 2, justifyContent: 'space-between' }}
                  radio_props={this.dStore.radioCashPrizeModeOptions}
                  formHorizontal
                  initial={this.dStore.cashPrizeMode}
                  buttonColor={'#FFC601'}
                  selectedButtonColor={'#FFC601'}
                  labelStyle={styles.radioButton}
                  buttonSize={13}
                  onPress={(value) => { this.dStore.changeCashPrizeMode(value); }}
                />
              </View>
            }

            {/* // 分销佣金承担 */}
            {
              // 有现金奖，并且模式为佣金内
              this.dStore.hasCashPrize === 0 && this.dStore.cashPrizeMode === 0 ?
                <View style={styles.rowWithBorder}>
                  <Text style={[styles.content, styles.contentLabel]}>分销佣金承担 : </Text>
                  <RadioForm
                    style={{ flex: 2, justifyContent: 'space-between' }}
                    radio_props={this.dStore.radioDistributionCommissionBearOptions}
                    formHorizontal
                    initial={this.dStore.distributionCommissionBear}
                    buttonColor={'#FFC601'}
                    selectedButtonColor={'#FFC601'}
                    labelStyle={styles.radioButton}
                    buttonSize={13}
                    onPress={(value) => { this.dStore.changeDistributionCommissionBear(value); }}
                  />
                </View>
                : null
            }


            {
              this.dStore.hasCashPrize === 0 &&
              <View style={styles.rowWithBorder}>
                <Text style={[styles.content, styles.contentLabel]}>现金奖金额 : </Text>
                <View style={styles.contentValue}>
                  <TextInput value={this.dStore.cashPrizeAmount} underlineColorAndroid="transparent" placeholder="请输入" width={80} keyboardType="numeric" onChangeText={(text) => this.dStore.changeCashPrizeAmount(text)} />
                  <Text style={styles.contentRight}>元</Text>
                </View>
              </View>
            }

            <View style={styles.rowWithBorder}>
              <Text style={[styles.content, styles.contentLabel]}>合作佣金 : </Text>
              <RadioForm
                style={{ flex: 2, justifyContent: 'space-between' }}
                radio_props={this.dStore.radioHasPropOptions}
                initial={this.dStore.hasCooperativeCommission}
                formHorizontal
                buttonColor={'#FFC601'}
                selectedButtonColor={'#FFC601'}
                labelStyle={styles.radioButton}
                buttonSize={13}
                onPress={(value) => { this.dStore.changeHasCooperativeCommission(value); }}
              />
            </View>

            {
              this.dStore.hasCooperativeCommission === 0 &&
              <View style={styles.rowWithBorder}>
                <Text style={[styles.content, styles.contentLabel]}>合作金额 : </Text>
                <View style={styles.contentValue}>
                  <TextInput value={this.dStore.cooperativeCommission} underlineColorAndroid="transparent" placeholder="请输入" width={80} keyboardType="numeric" onChangeText={(text) => this.dStore.changeCooperativeCommission(text)} />
                  <Text style={styles.contentRight}>元</Text>
                </View>
              </View>
            }

            {
              this.dStore.hasCooperativeCommission === 0 &&
              <View style={styles.rowWithBorder}>
                <Text style={[styles.content, styles.contentLabel]}>比例分配(项目:分销): </Text>
                <TouchableOpacity style={[styles.contentValue, { width: 160 }]} onPress={() => this.showPicker1(this.dStore.cooperativeProportion)}>
                  <TextInput
                    style={[styles.formInput, { width: 130, textAlign: 'right' }]}
                    placeholder="请选择"
                    placeholderTextColor="#a8a8a8"
                    underlineColorAndroid="transparent"
                    editable={false}
                    value={this.dStore.cooperativeProportion.join(':')}
                  />
                  <View style={styles.rightIcon} ><Icon name="bili" size={16} color="#3a3a3a" /></View>
                </TouchableOpacity>
              </View>
            }

            <View style={styles.rowWithBorder}>
              <Text style={[styles.content, styles.contentLabel]}>实际佣金 : </Text>
              <Text style={styles.contentRight}>{this.dStore.actualCommission} 元</Text>
            </View>

            <View style={styles.rowWithBorder}>
              <Text style={[styles.content, styles.contentLabel]}>佣金分配方式 : </Text>
              <RadioForm
                style={{ flex: 2, justifyContent: 'space-between' }}
                radio_props={this.dStore.radioActualCommissionModeOptions}
                initial={this.dStore.actualCommissionMode}
                formHorizontal
                buttonColor={'#FFC601'}
                selectedButtonColor={'#FFC601'}
                labelStyle={styles.radioButton}
                buttonSize={13}
                onPress={(value) => { this.dStore.changeActualCommissionMode(value); }}
              />
            </View>

            {
              this.dStore.actualCommissionMode === 0 ?
                <View style={styles.rowWithBorder}>
                  <Text style={[styles.content, styles.contentLabel]}>比例分配(项目:分销): </Text>
                  <TouchableOpacity style={[styles.contentValue, { width: 160 }]} onPress={() => this.showPicker2(this.dStore.actualProportion)}>
                    <TextInput
                      style={[styles.formInput, { width: 130, textAlign: 'right' }]}
                      placeholder="请选择"
                      placeholderTextColor="#a8a8a8"
                      underlineColorAndroid="transparent"
                      editable={false}
                      value={this.dStore.actualProportion.join(':')}
                    />
                    <View style={styles.rightIcon} ><Icon name="bili" size={16} color="#3a3a3a" /></View>
                  </TouchableOpacity>
                </View>
                :
                <View style={styles.rowWithBorder}>
                  <Text style={[styles.content, styles.contentLabel]}>定额佣金(分销): </Text>
                  <View style={styles.contentValue}>
                    <TextInput value={this.dStore.distributionFixedCommission} underlineColorAndroid="transparent" placeholder="请输入" width={80} keyboardType="numeric" onChangeText={(text) => this.dStore.changeDistributionFixedCommission(text)} />
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

            <View style={[styles.row, { height: 55.5, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e7e8ea' }]}>
              <View style={styles.flag} />
              <Text style={styles.subtitle}>项目人员佣金分配</Text>
            </View>

            <View style={styles.rowWithBorder}>
              <Text style={[styles.content, styles.contentLabel]}>姓名 : </Text>
              <Text style={styles.contentRight}>{this.dStore.projectPersonName}</Text>
            </View>

            {
              this.dStore.hasCooperativeCommission === 0 &&
              <View style={styles.rowWithBorder}>
                <Text style={[styles.content, styles.contentLabel]}>合作佣金（支出）: </Text>
                <Text style={styles.contentRight}>{this.dStore.projectCooperativeCommission} 元</Text>
              </View>
            }

            <View style={styles.rowWithBorder}>
              <Text style={[styles.content, styles.contentLabel]}>可结算佣金 : </Text>
              <Text style={styles.contentRight}>{this.dStore.projectSettlement} 元</Text>
            </View>

            {
              /* <View style={styles.separated} />
              <View style={[styles.row, { height: 55.5, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e7e8ea' }]}>
                <View style={styles.flag} />
                <Text style={styles.subtitle}>分销人员佣金分配</Text>
              </View>
              <TouchableOpacity style={[styles.rowWithBorder, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e7e8ea' }]} onPress={() => this.selectPerson()}>
                <Text style={[styles.content, styles.contentLabel]}>姓名 : </Text>
                <TextInput
                  style={[styles.formInput, { width: 190, textAlign: 'right' }]}
                  placeholder="请选择"
                  value={this.dStore.distributionPersonName}
                  placeholderTextColor="#a8a8a8"
                  underlineColorAndroid="transparent"
                  editable={false}
                />
                <View style={styles.rightIcon} ><Icon name="arrow-right" size={16} color="#3a3a3a" /></View>
              </TouchableOpacity>
              <View style={styles.rowWithBorder}>
                <Text style={[styles.content, styles.contentLabel]}>可结算佣金 : </Text>
                <Text style={styles.contentRight}>{this.dStore.distributionSettlement} 元</Text>
              </View>
              {this.dStore.hasCashPrize === 0 &&
                <View style={styles.rowWithBorder}>
                  <Text style={[styles.content, styles.contentLabel]}>可结现金奖 : </Text>
                  <Text style={styles.contentRight}>{this.dStore.distributionCashPrize} 元</Text>
                </View>
              }
              {this.dStore.hasCooperativeCommission === 0 &&
                <View style={styles.rowWithBorder}>
                  <Text style={[styles.content, styles.contentLabel]}>合作佣金 : </Text>
                  <Text style={styles.contentRight}>{this.dStore.distributionCooperativeCommission} 元</Text>
                </View>
              }
              */
            }

            {/* // *** */}
            {
              this.dStore.list.length > 0 &&
              <FlatList
                initialListSize={5}
                data={toJS(this.dStore.list)}
                renderItem={this.renderItem}
                keyExtractor={(item, index) => index.toString()}
                onViewableItemsChanged={() => {
                  if (this.dStore.itemFlag && this.scrollRef) {
                    this.scrollRef.scrollToEnd();
                  }
                }}
              />
            }

            {
              this.dStore.pickerMaskVisable &&
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
  fmPr: {
    paddingRight: 15,
  },
  container: {
    flex: 1,
    backgroundColor: '#F6F5FA',
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
