import Picker from 'react-native-picker';

/**
 * 比例分配组件
 * 此组件每个页面只能有一个，要自行区别多个字段弹出
 */
const ProportionPicker = {
  value: ['2.5', '7.5'],

  picker(options) {
    const data = [[], []];
    for (let i = 0; i <= 100; i += 1) {
      data[0].push(`${i / 10}`);
      data[1].push(`${(100 - i) / 10}`);
    }

    const defaultOptions = {
      pickerConfirmBtnText: '确定',
      pickerCancelBtnText: '取消',
      pickerTitleText: '调整比例分配(项目:分销)',
      pickerConfirmBtnColor: [77, 213, 163, 1],
      pickerCancelBtnColor: [58, 58, 58, 1],
      pickerTitleColor: [58, 58, 58, 1],
      pickerToolBarBg: [245, 245, 245, 1],
      pickerBg: [255, 255, 255, 1],

      pickerData: data,
      selectedValue: ProportionPicker.value,
      onPickerConfirm: (value) => {
      },
      onPickerCancel: (value) => {
      },
      onPickerSelect: (value) => {
        if (value[0] === ProportionPicker.value[0]) {
          value[0] = `${(100 - (value[1] * 10)) / 10}`;
        } else {
          value[1] = `${(100 - (value[0] * 10)) / 10}`;
        }
        ProportionPicker.value = value;
        Picker.select(ProportionPicker.value);
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

export default ProportionPicker;
