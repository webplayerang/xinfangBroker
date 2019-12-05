

import React, { PureComponent } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  DeviceEventEmitter,
} from 'react-native';
import MonthPicker from '../../components/MonthPicker';
import StartDateText from './StartDateText';
import EndDateText from './EndDateText';
import Icon from '../../components/Icon';
import BaseStyles from '../../style/BaseStyles';
import { getNowFormatDate } from '../../utils/tool';

export default class CustomDatePicker extends PureComponent {
  constructor(props) {
    super(props);
    const currentMonth = +this.props.date.substring(5, 7);
    let date = [];
    if (this.props.flag === 'garden') {
      date = [
        { month: '全部', activeBorder: true },
        { month: currentMonth, activeBorder: false },
        { month: currentMonth - 1, activeBorder: false },
        { month: currentMonth - 2, activeBorder: false },
        { month: '自定义日期', activeBorder: false },
      ];
    } else {
      date = [
        { month: currentMonth, activeBorder: true },
        { month: currentMonth - 1, activeBorder: false },
        { month: currentMonth - 2, activeBorder: false },
        { month: '自定义日期', activeBorder: false },
      ];
    }
    this.state = {
      refresh: 0,
      date,
      customTimeRange: '',
      startDate: getNowFormatDate().substring(0, 7),
      endDate: getNowFormatDate().substring(0, 7),
    };
    this.currentYear = '';
    this.startDate = '';
    this.endDate = '';
    this.customTimeFlag = false;
    this.monthPicker = MonthPicker;
  }

  componentDidMount() {
    this.customDateForm();
    MonthPicker.picker({

      onPickerConfirm: () => {
        this.props.parent.setState({
          monthPickerFlag: false,
        });
        if (this.currentPicker === 1) {
          this.setState({
            startDate: MonthPicker.value.join('-'),
          });
          this.startDateText.setState({
            date: MonthPicker.value.join('-'),
          });
        } else if (this.currentPicker === 2) {
          this.setState({
            endDate: MonthPicker.value.join('-'),
          });
          this.endDateText.setState({
            date: MonthPicker.value.join('-'),
          });
        }
      },
      onPickerCancel: () => {
        this.props.parent.setState({
          monthPickerFlag: false,
        });
      },
    });
  }


  componentWillUnmount() {
    // 防止没有关闭便跳转页面
    MonthPicker.hide();
  }


  // 父组件传进服务器日期后，确认单月份按钮的日期格式
  customDateForm() {
    const date = this.props.date;
    const currentMonth = +date.substring(5, 7);
    this.currentYear = +date.substring(0, 4);
    let lastMonth = 0;
    let monthBeforeLast = 0;
    // 当前月份 为1 或2 ，后面2个月显示去年的年份
    if (currentMonth === 1) {
      lastMonth = `${this.currentYear - 1}-12`;
      monthBeforeLast = `${this.currentYear - 1}-11`;// 空格是为了调整样式
    } else if (currentMonth === 2) {
      lastMonth = currentMonth - 1;
      monthBeforeLast = `${this.currentYear - 1}-12`;// 空格是为了调整样式
    } else {
      lastMonth = currentMonth - 1;
      monthBeforeLast = currentMonth - 2;
    }

    if (this.props.flag === 'garden') {
      this.setState({
        date: [
          { month: '全部', activeBorder: true },
          { month: currentMonth, activeBorder: false },
          { month: lastMonth, activeBorder: false },
          { month: monthBeforeLast, activeBorder: false },
          { month: '自定义日期', activeBorder: false },
        ],
        startDate: date.substring(0, 7),
        endDate: date.substring(0, 7),
      });
    } else {
      this.setState({
        date: [
          { month: currentMonth, activeBorder: true },
          { month: lastMonth, activeBorder: false },
          { month: monthBeforeLast, activeBorder: false },
          { month: '自定义日期', activeBorder: false },
        ],
        startDate: date.substring(0, 7),
        endDate: date.substring(0, 7),
      });
    }
  }

  showPicker1(value) {
    this.currentPicker = 1;
    const data = value.split('-');
    MonthPicker.show(data);
    this.props.parent.setState({
      monthPickerFlag: true,
    });
  }

  showPicker2(value) {
    this.currentPicker = 2;
    const data = value.split('-');
    MonthPicker.show(data);
    this.props.parent.setState({
      monthPickerFlag: true,
    });
  }
  // 点击切换底部active边框颜色
  changeAtiveBorder(month) {
    const { date } = this.state;

    // 单月份按钮时，切换executeTime参数, 得到需求格式日期‘YYYY-MM-DD’
    if (month !== '自定义日期') {
      const { filterParams } = this.props.parent;
      if (month === '全部') {
        filterParams.executeTime = '';
      } else {
        const TwoDigitMonth = month > 9 ? `${this.currentYear}-${month}` : (`${this.currentYear}-${month}`).replace('-', '-0');
        filterParams.executeTime = month.length === 7 ? month : TwoDigitMonth;
      }
      filterParams.startTime = '';
      filterParams.endTime = '';

      DeviceEventEmitter.emit(this.props.refresh);
    }


    this.setState({
      date: date.map((item) => {
        if (item.month === month) {
          item.activeBorder = true;
        } else {
          item.activeBorder = false;
        }
        return item;
      }),
    });
  }


  // 自定义日期 按钮
  selectDate() {
    this.props.parent.dialogbox.confirm({
      title: null,
      content: (
        <View style={styles.confirmContainer} >
          <View style={[BaseStyles.borderBt, { justifyContent: 'center', marginBottom: 10, height: 35 }]}>
            <Text style={[BaseStyles.text16, BaseStyles.black]}>自定义日期</Text>
          </View>
          <View>
            <TouchableOpacity
              style={styles.datePickerContainer}
              onPress={() => this.showPicker1(this.state.startDate)}
            >
              <Text style={[BaseStyles.text14, BaseStyles.deepGray]}>起始日期</Text>
              <View style={{ flexDirection: 'row' }} >
                <View style={styles.confirmDate} >
                  <StartDateText
                    textStyle={[BaseStyles.text14, BaseStyles.black]}
                    date={this.state.startDate}
                    ref={(startDateText) => { this.startDateText = startDateText; }}
                  />
                </View>
                <View><Icon name="rili" size={16} color="#a8a8a8" /></View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.datePickerContainer, { marginTop: 10 }]}
              onPress={() => this.showPicker2(this.state.endDate)}
            >
              <Text style={[BaseStyles.text14, BaseStyles.deepGray]}>结束日期</Text>
              <View style={{ flexDirection: 'row' }} >
                <View style={styles.confirmDate}>
                  <EndDateText
                    textStyle={[BaseStyles.text14, BaseStyles.black]}
                    date={this.state.endDate}
                    ref={(endDateText) => { this.endDateText = endDateText; }}
                  />
                </View>
                <View><Icon name="rili" size={16} color="#a8a8a8" /></View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      ),
      cancel: {
        text: '取消',
        style: {
          color: '#3a3a3a',
          fontSize: 18,
        },
        callback: () => {
          this.props.parent.dialogbox.close();
        },
      },
      ok: {
        text: '确认',
        style: {
          fontSize: 18,
          color: '#ffa200',
        },
        callback: () => {
          this.props.parent.dialogbox.close();

          let customTimeRange = '';
          // 确认真正的起始日期，而非用户输入的起始日期
          const startYear = +this.state.startDate.substring(0, 4);
          const endYear = +this.state.endDate.substring(0, 4);
          let interim = ''; // 过度参数
          if (startYear - endYear > 0) {
            interim = this.state.startDate;
            this.state.startDate = this.state.endDate;
            this.state.endDate = interim;
          } else if (startYear - endYear === 0) {
            const startMonth = +this.state.startDate.substring(5, 7);
            const endMonth = +this.state.endDate.substring(5, 7);
            if (startMonth - endMonth > 0) {
              interim = this.state.startDate;
              this.state.startDate = this.state.endDate;
              this.state.endDate = interim;
            }
          }
          const { filterParams } = this.props.parent;
          filterParams.executeTime = '';
          filterParams.startTime = this.state.startDate.length === 6 ? this.state.startDate.replace('-', '-0') : this.state.startDate;
          filterParams.endTime = this.state.endDate.length === 6 ? this.state.endDate.replace('-', '-0') : this.state.endDate;
          const startDate = this.state.startDate.replace('-0', '-');
          const endDate = this.state.endDate.replace('-0', '-');
          if (startDate === endDate) {
            customTimeRange = `${startDate}月`;
          } else {
            customTimeRange = `${startDate}月 至 ${endDate}月`;
          }
          this.customTimeFlag = true;
          this.setState({
            customTimeRange,
          });
          DeviceEventEmitter.emit(this.props.refresh);
        },
      },
    });
  }

  render() {
    let customTime = '';
    const { date } = this.state;
    const { flag } = this.props;
    if (date.length > 0) {
      if (flag === 'garden') {
        customTime = date[4];
      } else {
        customTime = date[3];
      }
    }

    return (
      <View style={[BaseStyles.borderBt, styles.container]} >
        <View style={{ flexDirection: 'row' }}>
          {
            date.map((val, index) => {
              if (val.month === '自定义日期') {
                return false;
              }
              const isActive = val.activeBorder;
              return (
                <TouchableOpacity
                  key={index.toString()}
                  style={[
                    styles.itemContainer,
                    isActive && styles.activeBorderLine,
                    { marginRight: 5 },
                  ]}
                  onPress={() => {
                    this.changeAtiveBorder(val.month);
                  }}
                >
                  <Text style={isActive ? BaseStyles.black : BaseStyles.gray}>
                    {val.month}
                    {this.props.flag === 'garden' && index === 0 ? '' : '月'}
                  </Text>
                </TouchableOpacity>
              );
            })
          }
        </View>
        <View>
          <TouchableOpacity
            style={[styles.itemContainer, customTime.activeBorder && styles.activeBorderLine]}
            onPress={() => {
              this.changeAtiveBorder(customTime.month);
              this.selectDate();
            }}
          >
            {/* <Text>
              {this.customTimeFlag ? this.state.customTimeRange : customTime.month}
            </Text> */}
            {this.customTimeFlag ?
              (
                <Text>{this.state.customTimeRange}</Text>
              ) :
              (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <Text style={{ color: '#62cdff' }}>{customTime.month}</Text>
                  <Icon name="arrow-right" size={12} color="#62cdff" style={{ paddingLeft: 5, marginTop: 2 }} />
                </View>
              )
            }
          </TouchableOpacity>
        </View>
      </View >
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 51,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#d9d8d9',
  },
  itemContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    borderBottomWidth: 3,

    borderBottomColor: '#fff',
  },
  activeBorderLine: {
    borderBottomColor: '#62cdff',
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f9',
    borderRadius: 5,
    borderColor: '#dedfe0',
    borderWidth: 1,
    paddingHorizontal: 15,
    height: 30,
  },
  confirmContainer: {
    justifyContent: 'space-around',
    alignItems: 'stretch',
    width: '100%',
    paddingHorizontal: 15,
  },
  confirmDate: {
    paddingRight: 10,
    alignItems: 'center',
    width: 70,
  },
});

