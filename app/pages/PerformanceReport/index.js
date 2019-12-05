import React, { PureComponent } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '../../components/Icon/';
import GoBack from '../../components/GoBack';
import BaseStyles from '../../style/BaseStyles';

export default class PerformanceReport extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerTitle: '业绩报告',
      headerRight: (
        <TouchableOpacity
          style={{ paddingRight: 15 }}
          onPress={() => {
            navigation.navigate('DealSearch');
          }}
        >
          <Icon name="magnifier" color="#848484" size={20} />
        </TouchableOpacity>
      ),
      headerLeft: <GoBack navigation={navigation} />,
    };
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { params = {} } = this.props.navigation.state;
    return (
      <View
        style={[
          BaseStyles.container,
          { alignItems: 'center', paddingVertical: 20 },
        ]}
      >
        <TouchableOpacity
          style={{ paddingVertical: 20 }}
          onPress={() => {
            params.defaultTitle = '全国战况实报';
            this.props.navigation.navigate('CountryPerformance', params);
          }}
        >
          <Text>全国报告</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ paddingVertical: 20 }}
          onPress={() => {
            this.props.navigation.navigate('CityPerformance', params);
          }}
        >
          <Text>城市报告</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ paddingVertical: 20 }}
          onPress={() => {
            this.props.navigation.navigate('PerforGardenSearch', params);
          }}
        >
          <Text>楼盘报告</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({});
