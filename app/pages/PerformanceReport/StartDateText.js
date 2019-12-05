// 改造 swiper 组件
import React, { PureComponent } from 'react';
import {
  View,
  Text,
} from 'react-native';

export default class StartDateText extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      date: '',
    };
  }


  render() {
    return (
      <View>
        <Text style={this.props.textStyle}>
          {this.state.date ? this.state.date : this.props.date}
        </Text>
      </View>
    );
  }
}
