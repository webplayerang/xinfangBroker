// 全国战报和城市战报 公用组件

import React, { PureComponent } from 'react';
import {
  View,
  Text,
  ScrollView,
  DeviceEventEmitter,
  TouchableOpacity,
} from 'react-native';
import DialogBox from '../../components/react-native-dialogbox';
import GoBack from '../../components/GoBack';
import HeaderTitle from '../../components/SelectTitle/HeaderTitle';
import SelectDialog from '../../components/SelectTitle/SelectDialog';
import FunnelChartData from '../../components/echartData/FunnelChartData';
import LineChartData from '../../components/echartData/LineChartData';
import PieChartData from '../../components/echartData/PieChartData';
import GardenChartData from '../../components/echartData/GardenChartData';
import PerforGardenList from './PerforGardenList';
import ReformSwiper from './ReformSwiper';
import CustomDatePicker from './CustomDatePicker';
import { screen } from '../../utils';
import BaseStyles from '../../style/BaseStyles';

export default class CountryPerformance extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;

    const headerTitle = params.who === 'WHOLE_CITY' && params.filterData.length === 1 ?
      params.defaultTitle : (<HeaderTitle params={params} />);
    return {
      headerTitle,
      headerRight: <Text />,
      headTitleStyle: {
        alignSelf: 'center',
      },
      headerLeft: <GoBack navigation={navigation} />,
    };
  };

  constructor(props) {
    super(props);
    const { params } = this.props.navigation.state;
    this.state = {
      monthPickerFlag: false,
      filterData: params.filterData,
    };
    this.filterParams = {
      executeTime: params.serverDate,
      startTime: '',
      endTime: '',
      orgunitId: params.orgunitId,
    };
    this.serverDate = params.serverDate;
  }

  // 下拉导航title 筛选后  保存筛选参数和触发刷新事件
  filterDo(val) {
    if (val) {
      this.scrollView.scrollTo({ x: 0, y: 0, animated: false });
      this.filterParams.orgunitId = val.id;
      DeviceEventEmitter.emit('CountryPerformance');
    }
  }

  // monthPicker组件需要的遮罩层
  monthPickerOverlay() {
    if (this.state.monthPickerFlag) {
      return (
        <TouchableOpacity
          activeOpacity={1}
          style={{
            zIndex: 1000,
            opacity: 1,
            width: '100%',
            height: screen.height,
          }}
          onPress={() => {
            this.customDatePicker.monthPicker.hide();
            this.setState({
              monthPickerFlag: false,
            });
          }}
        />
      );
    }
    return null;
  }

  render() {
    return (
      <View style={BaseStyles.container}>
        {this.monthPickerOverlay()}
        {/* 导航下拉弹窗 */}
        <SelectDialog data={this.state.filterData} parent={this} />
        <DialogBox ref={(dialogbox) => { this.dialogbox = dialogbox; }} />
        <CustomDatePicker
          date={this.serverDate}
          parent={this}
          refresh={'CountryPerformance'}
          ref={(customDatePicker) => { this.customDatePicker = customDatePicker; }}
        />
        <ScrollView ref={(scrollView) => { this.scrollView = scrollView; }}>
          {/* swiper组件 */}
          <ReformSwiper parent={this} who={this.props.navigation.state.params.who} refresh={'CountryPerformance'} />
          <FunnelChartData parent={this} refresh={'CountryPerformance'} />
          {/* 下拉导航title 选择分公司时，不显示分公司营收折线图 */}
          {this.props.navigation.state.params.defaultTitle === '全国战况实报' ?
            <LineChartData parent={this} refresh={'CountryPerformance'} />
            : null
          }
          <GardenChartData parent={this} refresh={'CountryPerformance'} />
          {/* 楼盘列表 */}
          <PerforGardenList
            navigation={this.props.navigation}
            filterData={this.state.filterData}
            parent={this}
          />
          <PieChartData parent={this} refresh={'CountryPerformance'} />
        </ScrollView>
      </View>
    );
  }
}

