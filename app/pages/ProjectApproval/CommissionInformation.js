import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  InteractionManager,
  ScrollView,
  DeviceEventEmitter,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import Toast from 'react-native-easy-toast';
// 友盟统计
import axiosErp from '../../common/AxiosInstance';

import DialogBox from '../../components/react-native-dialogbox';
import Icon from '../../components/Icon/';
import GoBack from '../../components/GoBack';

import BaseStyles from '../../style/BaseStyles';

// 认筹详情页面

export default class CommissionInformation extends PureComponent {
  // static propTypes = {
  //   navigation: PropTypes.object,
  // }

  // static defaultProps = {
  //   navigation: {},
  // }
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      title: '分佣信息',
      headerLeft: (<GoBack navigation={navigation} />),
      headerRight: (<Text />),
    };
  };

  // constructor(props) {
  //   super(props);
  // }

  componentDidMount() {

  }

  renderCommission(subscribeBillData) {
    return (
      <View style={{ marginTop: 10 }}>

        {/* 分销款分佣信息 */}
        <View style={[styles.commonHeader, BaseStyles.borderBt]}>
          <View style={styles.leftYellow}>
            <Text style={styles.commonTitle}>分销款分佣信息</Text>
          </View>
        </View>

        {/* 实际佣金点数： */}
        <View style={[styles.main, BaseStyles.borderBt]}>
          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>实际佣金点数：</Text>
            <Text style={styles.mainContent}>{subscribeBillData.commission.proportion}</Text>
          </View>
          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>实结佣金：</Text>
            <Text style={styles.mainContent}>{subscribeBillData.commission.actualValue}元</Text>
          </View>
          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>应结佣金：</Text>
            <Text style={styles.mainContent}>{subscribeBillData.commission.shouldValue}元</Text>
          </View>
          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>
              {subscribeBillData.commission.actualType === 'PROPORTION' ? '比例分佣：' : '定额分佣：'}
            </Text>
            <Text style={styles.mainContent}>
              {
                subscribeBillData.commission.actualType === 'PROPORTION' ?
                  (`${subscribeBillData.commission.actualA}:${subscribeBillData.commission.actualB}`)
                  : `${subscribeBillData.commission.actualFixation}元`
              }
            </Text>

          </View>
        </View>

        <View style={[styles.main, BaseStyles.borderBt]}>
          <View style={styles.mainItem}>
            <View style={styles.mainItemHalf}>
              <Text style={styles.mainLabelShort}>合作佣金：</Text>
              <Text style={styles.mainContent}>{subscribeBillData.commission.cooperation}元</Text>
            </View>

            <View style={styles.mainItemHalf}>
              <Text style={styles.mainLabelShort}>分配比例：</Text>
              <Text style={styles.mainContent}>
                {subscribeBillData.commission.cooperationA}:{subscribeBillData.commission.cooperationB}(项目:分销)
              </Text>
            </View>

          </View>

          <View style={styles.mainItem}>
            <View style={styles.mainItemHalf}>
              <Text style={styles.mainLabelShort}>现金奖：</Text>
              <Text style={styles.mainContent}>{subscribeBillData.commission.award}元</Text>
            </View>

            <View style={styles.mainItemHalf}>
              <Text style={styles.mainLabelShort}>分配比例：</Text>
              <Text style={styles.mainContent}>
                {subscribeBillData.commission.awardA}:{subscribeBillData.commission.awardB}(项目:分销)
              </Text>
            </View>

          </View>

          <View style={styles.mainItem}>
            <Text style={styles.mainLabelShort}>是否含现金奖：</Text>
            <Text style={styles.mainContent}>{subscribeBillData.commission.includeAward === 'YES' ? '是' : '否'}</Text>
          </View>

        </View>

        {/* 项目佣金分配： */}
        <View style={[styles.main, { marginTop: 10 }]}>
          <View style={styles.totalContainer}>
            <Text style={styles.mainLabel}>项目佣金分配：</Text>
            <Text style={styles.mainContent}>
              合计
              <Text style={BaseStyles.orange}>
                {subscribeBillData.projectTotal.total}
              </Text>
              元
            </Text>
          </View>
          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>佣金：</Text>
            <Text style={styles.mainContent}>{subscribeBillData.projectTotal.actual}元</Text>
          </View>
          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>现金奖：</Text>
            <Text style={styles.mainContent}>{subscribeBillData.projectTotal.award}元</Text>
          </View>
          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>合作佣金：</Text>
            <Text style={styles.mainContent}>{subscribeBillData.projectTotal.cooperation}元</Text>
          </View>
        </View>

        {
          subscribeBillData.projectCommissionAssignList.map((item) => (
            <View style={{ backgroundColor: '#fff', paddingBottom: 15 }} key={Math.random()}>

              <View style={styles.mainGrayContainer}>
                <View style={styles.mainItem}>
                  <Text style={styles.mainLabelShort}>项目人员：</Text>
                  <Text style={styles.mainContent}>{item.employe.name}</Text>
                </View>

                <View style={styles.mainItem}>
                  <Text style={styles.mainLabelShort}>所属公司：</Text>
                  <Text style={styles.mainContent}>{item.company.name}</Text>
                </View>

                <View style={styles.mainItem}>
                  <Text style={styles.mainLabelShort}>所属部门：</Text>
                  <Text style={styles.mainContent}>{item.employe.orgName}</Text>
                </View>

                <View style={styles.mainItem}>
                  <View style={styles.mainItemHalf}>
                    <Text style={styles.mainLabelShort}>可结算佣金：</Text>
                    <Text style={styles.mainContent}>{item.value.actual}元</Text>
                  </View>

                  <View style={styles.mainItemHalf}>
                    <Text style={styles.mainLabelShort}>佣金比例：</Text>
                    <Text style={styles.mainContent}>{item.proportion.actual}</Text>
                  </View>


                </View>
                <View style={styles.mainItem}>
                  <View style={styles.mainItemHalf}>
                    <Text style={styles.mainLabelShort}>可结现金奖：</Text>
                    <Text style={styles.mainContent}>{item.value.award}元</Text>
                  </View>

                  <View style={styles.mainItemHalf}>
                    <Text style={styles.mainLabelShort}>现金奖比例：</Text>
                    <Text style={styles.mainContent}>{item.proportion.award}</Text>
                  </View>
                </View>

                <View style={styles.mainItem}>
                  <View style={styles.mainItemHalf}>
                    <Text style={styles.mainLabelShort}>合作佣金：</Text>
                    <Text style={styles.mainContent}>{item.value.cooperation}元</Text>
                  </View>
                  <View style={styles.mainItemHalf}>
                    <Text style={styles.mainLabelShort}>合作佣金比例：</Text>
                    <Text style={styles.mainContent}>{item.proportion.cooperation}</Text>
                  </View>
                </View>
              </View>


            </View>

          ))
        }


        {/* 分销佣金分配： */}
        <View style={[styles.main, { marginTop: 10 }]}>
          <View style={styles.totalContainer}>
            <Text style={styles.mainLabel}>分销佣金分配：</Text>
            <Text style={styles.mainContent}>
              合计
              <Text style={BaseStyles.orange}>
                {subscribeBillData.otherTotal.total}
              </Text>
              元
            </Text>
          </View>
          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>佣金：</Text>
            <Text style={styles.mainContent}>{subscribeBillData.otherTotal.actual}元</Text>
          </View>
          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>现金奖：</Text>
            <Text style={styles.mainContent}>{subscribeBillData.otherTotal.award}元</Text>
          </View>
          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>合作佣金：</Text>
            <Text style={styles.mainContent}>{subscribeBillData.otherTotal.cooperation}元</Text>
          </View>
        </View>


        {
          subscribeBillData.otherCommissionAssignList.map((item) => (
            <View style={{ backgroundColor: '#fff', paddingBottom: 15 }} key={Math.random()}>

              <View style={styles.mainGrayContainer}>
                <View style={styles.mainItem}>
                  <Text style={styles.mainLabelShort}>项目人员：</Text>
                  <Text style={styles.mainContent}>{item.employe.name}</Text>
                </View>

                <View style={styles.mainItem}>
                  <Text style={styles.mainLabelShort}>所属公司：</Text>
                  <Text style={styles.mainContent}>{item.company.name}</Text>
                </View>

                <View style={styles.mainItem}>
                  <Text style={styles.mainLabelShort}>所属部门：</Text>
                  <Text style={styles.mainContent}>{item.employe.orgName}</Text>
                </View>

                <View style={styles.mainItem}>
                  <View style={styles.mainItemHalf}>
                    <Text style={styles.mainLabelShort}>可结算佣金：</Text>
                    <Text style={styles.mainContent}>{item.value.actual}元</Text>
                  </View>

                  <View style={styles.mainItemHalf}>
                    <Text style={styles.mainLabelShort}>佣金比例：</Text>
                    <Text style={styles.mainContent}>{item.proportion.actual}</Text>
                  </View>


                </View>
                <View style={styles.mainItem}>
                  <View style={styles.mainItemHalf}>
                    <Text style={styles.mainLabelShort}>可结现金奖：</Text>
                    <Text style={styles.mainContent}>{item.value.award}元</Text>
                  </View>

                  <View style={styles.mainItemHalf}>
                    <Text style={styles.mainLabelShort}>现金奖比例：</Text>
                    <Text style={styles.mainContent}>{item.proportion.award}</Text>
                  </View>
                </View>

                <View style={styles.mainItem}>
                  <View style={styles.mainItemHalf}>
                    <Text style={styles.mainLabelShort}>合作佣金：</Text>
                    <Text style={styles.mainContent}>{item.value.cooperation}元</Text>
                  </View>
                  <View style={styles.mainItemHalf}>
                    <Text style={styles.mainLabelShort}>合作佣金比例：</Text>
                    <Text style={styles.mainContent}>{item.proportion.cooperation}</Text>
                  </View>
                </View>
              </View>


            </View>

          ))
        }

      </View>


    );
  }

  renderGroupon(subscribeBillData) {
    return (
      <View style={{ marginTop: 10 }}>

        {/* 团购费分佣信息 */}
        <View style={[styles.commonHeader, BaseStyles.borderBt]}>
          <View style={styles.leftYellow}>
            <Text style={styles.commonTitle}>团购费分佣信息</Text>
          </View>
        </View>

        {/* 团购费 */}
        <View style={[styles.main, BaseStyles.borderBt]}>
          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>团购费：</Text>
            <Text style={styles.mainContent}>{subscribeBillData.groupon.groupon}</Text>
          </View>
          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>实结佣金：</Text>
            <Text style={styles.mainContent}>{subscribeBillData.groupon.actualValue}元</Text>
          </View>
          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>应结佣金：</Text>
            <Text style={styles.mainContent}>{subscribeBillData.groupon.shouldValue}元</Text>
          </View>
          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>
              {subscribeBillData.groupon.actualType === 'PROPORTION' ? '比例分佣：' : '定额分佣：'}
            </Text>
            <Text style={styles.mainContent}>
              {
                subscribeBillData.groupon.actualType === 'PROPORTION' ?
                  (`${subscribeBillData.groupon.actualA}:${subscribeBillData.groupon.actualB}`)
                  : `${subscribeBillData.groupon.actualFixation}元`
              }
            </Text>

          </View>
        </View>

        <View style={[styles.main, BaseStyles.borderBt]}>
          <View style={styles.mainItem}>
            <View style={styles.mainItemHalf}>
              <Text style={styles.mainLabelShort}>合作佣金：</Text>
              <Text style={styles.mainContent}>{subscribeBillData.groupon.cooperation}元</Text>
            </View>

            <View style={styles.mainItemHalf}>
              <Text style={styles.mainLabelShort}>分配比例：</Text>
              <Text style={styles.mainContent}>
                {subscribeBillData.groupon.cooperationA}:{subscribeBillData.groupon.cooperationB}(项目:分销)
              </Text>
            </View>

          </View>

          <View style={styles.mainItem}>
            <View style={styles.mainItemHalf}>
              <Text style={styles.mainLabelShort}>现金奖：</Text>
              <Text style={styles.mainContent}>{subscribeBillData.groupon.award}元</Text>
            </View>

            <View style={styles.mainItemHalf}>
              <Text style={styles.mainLabelShort}>分配比例：</Text>
              <Text style={styles.mainContent}>
                {subscribeBillData.groupon.awardA}:{subscribeBillData.groupon.awardB}(项目:分销)
              </Text>
            </View>

          </View>

          <View style={styles.mainItem}>
            <Text style={styles.mainLabelShort}>是否含现金奖：</Text>
            <Text style={styles.mainContent}>{subscribeBillData.groupon.includeAward === 'YES' ? '是' : '否'}</Text>
          </View>

        </View>

        {/* 项目佣金分配： */}
        <View style={[styles.main, { marginTop: 10 }]}>
          <View style={styles.totalContainer}>
            <Text style={styles.mainLabel}>项目佣金分配：</Text>
            <Text style={styles.mainContent}>
              合计
              <Text style={BaseStyles.orange}>
                {subscribeBillData.gProjectTotal.total}
              </Text>
              元
            </Text>
          </View>
          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>佣金：</Text>
            <Text style={styles.mainContent}>{subscribeBillData.gProjectTotal.actual}元</Text>
          </View>
          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>现金奖：</Text>
            <Text style={styles.mainContent}>{subscribeBillData.gProjectTotal.award}元</Text>
          </View>
          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>合作佣金：</Text>
            <Text style={styles.mainContent}>{subscribeBillData.gProjectTotal.cooperation}元</Text>
          </View>
        </View>

        {
          subscribeBillData.gProjectCommissioneAssignList.map((item) => (
            <View style={{ backgroundColor: '#fff', paddingBottom: 15 }} key={Math.random()}>

              <View style={styles.mainGrayContainer}>
                <View style={styles.mainItem}>
                  <Text style={styles.mainLabelShort}>项目人员：</Text>
                  <Text style={styles.mainContent}>{item.employe.name}</Text>
                </View>

                <View style={styles.mainItem}>
                  <Text style={styles.mainLabelShort}>所属公司：</Text>
                  <Text style={styles.mainContent}>{item.company.name}</Text>
                </View>

                <View style={styles.mainItem}>
                  <Text style={styles.mainLabelShort}>所属部门：</Text>
                  <Text style={styles.mainContent}>{item.employe.orgName}</Text>
                </View>

                <View style={styles.mainItem}>
                  <View style={styles.mainItemHalf}>
                    <Text style={styles.mainLabelShort}>可结算佣金：</Text>
                    <Text style={styles.mainContent}>{item.value.actual}元</Text>
                  </View>

                  <View style={styles.mainItemHalf}>
                    <Text style={styles.mainLabelShort}>佣金比例：</Text>
                    <Text style={styles.mainContent}>{item.proportion.actual}</Text>
                  </View>


                </View>
                <View style={styles.mainItem}>
                  <View style={styles.mainItemHalf}>
                    <Text style={styles.mainLabelShort}>可结现金奖：</Text>
                    <Text style={styles.mainContent}>{item.value.award}元</Text>
                  </View>

                  <View style={styles.mainItemHalf}>
                    <Text style={styles.mainLabelShort}>现金奖比例：</Text>
                    <Text style={styles.mainContent}>{item.proportion.award}</Text>
                  </View>
                </View>

                <View style={styles.mainItem}>
                  <View style={styles.mainItemHalf}>
                    <Text style={styles.mainLabelShort}>合作佣金：</Text>
                    <Text style={styles.mainContent}>{item.value.cooperation}元</Text>
                  </View>
                  <View style={styles.mainItemHalf}>
                    <Text style={styles.mainLabelShort}>合作佣金比例：</Text>
                    <Text style={styles.mainContent}>{item.proportion.cooperation}</Text>
                  </View>
                </View>
              </View>


            </View>

          ))
        }


        {/* 分销佣金分配： */}
        <View style={[styles.main, { marginTop: 10 }]}>
          <View style={styles.totalContainer}>
            <Text style={styles.mainLabel}>分销佣金分配：</Text>
            <Text style={styles.mainContent}>
              合计
              <Text style={BaseStyles.orange}>
                {subscribeBillData.gOtherTotal.total}
              </Text>
              元
            </Text>
          </View>
          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>佣金：</Text>
            <Text style={styles.mainContent}>{subscribeBillData.gOtherTotal.actual}元</Text>
          </View>
          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>现金奖：</Text>
            <Text style={styles.mainContent}>{subscribeBillData.gOtherTotal.award}元</Text>
          </View>
          <View style={styles.mainItem}>
            <Text style={styles.mainLabel}>合作佣金：</Text>
            <Text style={styles.mainContent}>{subscribeBillData.gOtherTotal.cooperation}元</Text>
          </View>
        </View>


        {
          subscribeBillData.gOtherCommissionAssignList.map((item) => (
            <View style={{ backgroundColor: '#fff', paddingBottom: 15 }} key={Math.random()}>

              <View style={styles.mainGrayContainer}>
                <View style={styles.mainItem}>
                  <Text style={styles.mainLabelShort}>项目人员：</Text>
                  <Text style={styles.mainContent}>{item.employe.name}</Text>
                </View>

                <View style={styles.mainItem}>
                  <Text style={styles.mainLabelShort}>所属公司：</Text>
                  <Text style={styles.mainContent}>{item.company.name}</Text>
                </View>

                <View style={styles.mainItem}>
                  <Text style={styles.mainLabelShort}>所属部门：</Text>
                  <Text style={styles.mainContent}>{item.employe.orgName}</Text>
                </View>

                <View style={styles.mainItem}>
                  <View style={styles.mainItemHalf}>
                    <Text style={styles.mainLabelShort}>可结算佣金：</Text>
                    <Text style={styles.mainContent}>{item.value.actual}元</Text>
                  </View>

                  <View style={styles.mainItemHalf}>
                    <Text style={styles.mainLabelShort}>佣金比例：</Text>
                    <Text style={styles.mainContent}>{item.proportion.actual}</Text>
                  </View>


                </View>
                <View style={styles.mainItem}>
                  <View style={styles.mainItemHalf}>
                    <Text style={styles.mainLabelShort}>可结现金奖：</Text>
                    <Text style={styles.mainContent}>{item.value.award}元</Text>
                  </View>

                  <View style={styles.mainItemHalf}>
                    <Text style={styles.mainLabelShort}>现金奖比例：</Text>
                    <Text style={styles.mainContent}>{item.proportion.award}</Text>
                  </View>
                </View>

                <View style={styles.mainItem}>
                  <View style={styles.mainItemHalf}>
                    <Text style={styles.mainLabelShort}>合作佣金：</Text>
                    <Text style={styles.mainContent}>{item.value.cooperation}元</Text>
                  </View>
                  <View style={styles.mainItemHalf}>
                    <Text style={styles.mainLabelShort}>合作佣金比例：</Text>
                    <Text style={styles.mainContent}>{item.proportion.cooperation}</Text>
                  </View>
                </View>
              </View>


            </View>

          ))
        }

      </View>
    );
  }

  render() {
    const { subscribeBillData } = this.props.navigation.state.params;

    return (
      <View style={BaseStyles.container}>
        <ScrollView style={styles.container}>

          {subscribeBillData.existCommission ?
            this.renderCommission(subscribeBillData)
            : null
          }

          {subscribeBillData.existGroupon ?
            this.renderGroupon(subscribeBillData)
            : null
          }


        </ScrollView>


      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  commonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 66,
    backgroundColor: '#fff',
  },
  leftYellow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderLeftWidth: 3,
    borderLeftColor: '#ffc601',
  },
  commonTitle: {
    paddingLeft: 12,
    fontSize: 18,
    color: '#3a3a3a',
  },


  main: {
    flex: 1,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    paddingBottom: 15,
  },

  mainGrayContainer: {
    flex: 1,
    marginHorizontal: 15,
    paddingHorizontal: 10,
    paddingBottom: 15,
    backgroundColor: '#f5f5f9',
    borderColor: '#e7e8ea',
    borderWidth: StyleSheet.hairlineWidth,
  },

  mainItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 15,
  },

  mainLabel: {
    color: '#a8a8a8',
    fontSize: 14,
    width: 110,
  },

  mainLabelShort: {
    color: '#a8a8a8',
    fontSize: 14,
    // width: 80,
  },

  mainContent: {
    color: '#3a3a3a',
    fontSize: 14,
  },

  mainItemHalf: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '50%',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
  },

});

