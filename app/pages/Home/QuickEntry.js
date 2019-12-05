import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  DeviceEventEmitter,
  InteractionManager,
} from 'react-native';
// import { NavigationActions } from 'react-navigation';
import axios from 'axios';
import axiosErp from '../../common/AxiosInstance';
import { UMNative } from '../../common/NativeHelper';
import Icon from '../../components/Icon/';
import BaseStyles from '../../style/BaseStyles';
import { screen } from '../../utils';


export default class QuickEntry extends PureComponent {
  static navigationOptions = {
    header: null,
  };
  // static propTypes = {
  //   navigation: PropTypes.objectOf(PropTypes.object),
  //   navigate: PropTypes.func,
  // }
  // static defaultProps = {
  //   navigation: null,
  //   navigate: null,
  // }
  constructor(props) {
    super(props);
    this.state = {
      approvalCount: 0,
    };

    this.entryProjectApprovalFlag = false;
    this.erpParams = {};
    this.navigateTo = this.navigateTo.bind(this);
  }

  componentDidMount() {
    // 获取 项目审批  待审批总数量
    this.getTotalPrepareAuditNumber();

    this.listener = DeviceEventEmitter.addListener('ProjectApproval', () => {
      this.getTotalPrepareAuditNumber();
    });

    this.ResetErpDefaultParamsListener = DeviceEventEmitter.addListener('ResetErpDefaultParams',
      (params) => {
        this.erpParams._erpPositionId = encodeURIComponent(params.positionId);
        this.erpParams._erpPositionTypeId = encodeURIComponent(params.positionTypeId);
        axiosErp.changeDefaultParams(this.erpParams); // 设置 erp 的 默认请求参数
        this.getTotalPrepareAuditNumber();
      },
    );
  }

  componentWillUnmount() {
    this.listener.remove();
    this.ResetErpDefaultParamsListener.remove();
  }

  // 获取 erp的项目审批    默认请求参数
  getERPPosition() {
    return axios.get('user/detail')
      .then((res) => {
        if (res.data.status === 'C0000') {
          const params = res.data.result;

          this.erpParams = {
            _erpId: encodeURIComponent(params.erpId),
            _erpPositionId: encodeURIComponent(params.positionId),
            _erpPositionTypeId: encodeURIComponent(params.positionTypeId),
          };

          this.entryProjectApprovalFlag = true;
          return true;
        }
        this.entryProjectApprovalFlag = false;
        return false;
      })
      .catch(() => {
        this.entryProjectApprovalFlag = false;
        return false;
      });
  }

  // 获取 项目审批  待审批总数量
  async getTotalPrepareAuditNumber() {
    if (!this.entryProjectApprovalFlag) {
      this.entryProjectApprovalFlag = await this.getERPPosition();
    }
    if (this.entryProjectApprovalFlag) {
      axiosErp.changeDefaultParams(this.erpParams); // 设置 erp 的 默认请求参数
      axiosErp.instance.get('appSubscribe/getTotalPrepareAuditNumber')
        .then((res) => {
          const { totalPrepareAuditNumber } = res.data;
          this.setState({
            approvalCount: totalPrepareAuditNumber || 0,
          });
        }).catch((err) => {
          console.info(err);
        });
    }
  }

  // 获取服务器日期失败时，给本地日期作为默认值
  getServerDate() {
    return axios.get('companyStatistics/getCurrentDate')
      .then((res) => res.data.result.substring(0, 7).replace('/', '-'))
      .catch(() => new Date().toLocaleDateString().substring(0, 7).replace('/', '-'));
  }

  // 获取 业绩报告页的 导航下拉title数据
  getFilterData() {
    return axios.get('companyStatistics/getOrgunits')
      .then((res) => {
        if (res.data.status === 'C0000') {
          return res.data.result;
        }
        return [];
      })
      .catch(() => []);
  }


  // 跳转路由 公共方法
  navigateTo(route, params = {}) {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate(route, params);
    });
  }

  // 获取服务器日期 和 业绩报告页面的导航下拉title数据后 再跳转 业绩报告
  toPerformanceReport() {
    axios.all([this.getServerDate(), this.getFilterData()])
      .then(axios.spread((serverDate, filterData) => {
        axios.get('companyStatistics/getRegionalAuthorityEnum')
          .then((res) => {
            const who = res.data.result;
            if (who === 'WHOLE_COUNTRY') {
              filterData.unshift({ name: '全国战况实报' });

              UMNative.onEvent('COUNTRY_PERFORMANCE_COUNT');

              this.navigateTo('CountryPerformance',
                { who, serverDate, filterData, defaultTitle: '全国战况实报' });
            } else if (who === 'WHOLE_CITY') {
              UMNative.onEvent('CITY_PERFORMANCE_COUNT');

              this.navigateTo('CountryPerformance',
                {
                  who,
                  serverDate,
                  filterData,
                  defaultTitle: filterData[0].name,
                  orgunitId: filterData[0].id,
                });
            } else {
              UMNative.onEvent('GARDEN_PERFORMANCE_COUNT');

              this.navigateTo('PerforGardenAll', {
                who, serverDate, defaultTitle: '全部楼盘', flag: true,
              });
            }
          })
          .catch(() => {
            this.props.parent.toast.show('业绩报告接口异常');
          });
      }));
  }

  render() {
    const { approvalCount } = this.state;
    return (
      <View style={styles.quickEntry}>
        <TouchableOpacity
          style={styles.entryItem}
          onPress={() => this.navigateTo('ReportManage')}
        >
          <View
            style={[styles.entryItemIcon, { backgroundColor: '#ffc601' }]}
          >
            <Icon name="baobeiguanli" size={22} color="#fff" />
          </View>
          <Text style={styles.entryItemText}>报备管理</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.entryItem}
          onPress={() => this.navigateTo('RecognizeManage')}
        >
          <View
            style={[styles.entryItemIcon, { backgroundColor: '#62cdff' }]}
          >
            <Icon name="renchouguanli" size={22} color="#fff" />
          </View>
          <Text style={styles.entryItemText}>认筹管理</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.entryItem}
          onPress={() => this.navigateTo('DealManage')}
        >
          <View
            style={[styles.entryItemIcon, { backgroundColor: '#d5a2fc' }]}
          >
            <Icon name="chengjiaoguanli" size={22} color="#fff" />
          </View>
          <Text style={styles.entryItemText}>成交管理</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.entryItem}
          onPress={() => this.toPerformanceReport()}
        >
          <View
            style={[styles.entryItemIcon, { backgroundColor: '#4ed5a4' }]}
          >
            <Icon name="yejibaogao" size={22} color="#fff" />
          </View>
          <Text style={styles.entryItemText}>数据中心</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.entryItem, { position: 'relative' }]}
          onPress={() => {
            if (this.entryProjectApprovalFlag) {
              this.navigateTo('ProjectApproval');
            } else {
              this.props.parent.toast.show('无法获取ERP职位');
            }
          }}
        >
          {
            approvalCount ?
              <View style={styles.redPoint} />
              : null
          }
          <View
            style={[styles.entryItemIcon, { backgroundColor: '#6cd9d0' }]}
          >
            <Icon name="xiangmushenpi" size={22} color="#fff" />
          </View>
          <Text style={styles.entryItemText}>项目审批</Text>
        </TouchableOpacity>

      </View >
    );
  }
}

const styles = StyleSheet.create({
  quickEntry: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: '#fff',
    height: 100,
  },
  entryItem: {
    flex: 1,
    alignItems: 'center',
  },
  entryItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryItemText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 10,
    color: '#7e7e7e',
  },
  redPoint: {
    position: 'absolute',
    top: 2,
    right: 20,
    width: 8,
    height: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#fff',
    borderRadius: 4,
    backgroundColor: '#ff0101',
    zIndex: 2,
    alignItems: 'center',
  },

});
