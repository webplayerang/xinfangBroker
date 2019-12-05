import Picker from 'react-native-picker';

/**
 * 比例分配组件
 * 此组件每个页面只能有一个，要自行区别多个字段弹出
 */
const userDate = new Date();
const MonthPicker = {
  value: [userDate.getFullYear(), userDate.getMonth() + 1],

  picker(options) {
    const data = [[], []];
    for (let i = 2000; i <= 2030; i += 1) {
      data[0].push(i);
    }
    for (let i = 1; i <= 12; i += 1) {
      data[1].push(i);
    }

    const defaultOptions = {
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText: '选择日期',
      pickerConfirmBtnColor: [77, 213, 163, 1],
      pickerCancelBtnColor: [58, 58, 58, 1],
      pickerTitleColor: [58, 58, 58, 1],
      pickerToolBarBg: [245, 245, 245, 1],
      pickerBg: [255, 255, 255, 1],

      pickerData: data,
      selectedValue: MonthPicker.value,
      onPickerConfirm: (value) => {
      },
      onPickerCancel: (value) => {
      },
      onPickerSelect: (value) => {
        // if (value[0] === MonthPicker.value[0]) {
        //   value[0] = `${(100 - (value[1] * 10)) / 10}`;
        // } else {
        //   value[1] = `${(100 - (value[0] * 10)) / 10}`;
        // }
        MonthPicker.value = value;
        Picker.select(MonthPicker.value);
      },
    };
    Picker.init(Object.assign(defaultOptions, options));
    Picker.hide();
  },

  show(value) {
    Picker.hide();
    Picker.show();
    if (value) {
      Picker.select(value);
    }
  },

  hide() {
    Picker.hide();
  },
};

export default MonthPicker;
