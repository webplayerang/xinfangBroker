import React, { PureComponent } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import DialogBox from '../../components/react-native-dialogbox';
import ProjectMemberList from './ProjectMemberList';
import CustomDatePicker from './CustomDatePicker';
import ReformSwiper from './ReformSwiper';
import FunnelChartData from '../../components/echartData/FunnelChartData';
import RecognizeChartData from '../../components/echartData/RecognizeChartData';
import PieChartData from '../../components/echartData/PieChartData';
import GoBack from '../../components/GoBack';
import { screen } from '../../utils';
import BaseStyles from '../../style/BaseStyles';

export default class GardenPerformance extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      headerTitle: (
        <View style={styles.headerTitle}>
          <Text style={[BaseStyles.text18, BaseStyles.black]}>
            {params.expandName.length > 10 ?
              `${params.expandName.substring(0, 10)}...`
              :
              params.expandName
            }
          </Text>
          <Text style={[BaseStyles.text10, BaseStyles.black]}>
            {`${params.distributionStartDateStr}-${params.distributionEndDateStr}`}
          </Text>
        </View>
      ),
      headerRight: <Text />,
      headerLeft: <GoBack navigation={navigation} />,
    };
  };

  constructor(props) {
    super(props);
    const { params } = this.props.navigation.state;
    this.state = {
      monthPickerFlag: false,
      filterData: [],
    };
    this.filterParams = {
      executeTime: '',
      startTime: '',
      endTime: '',
      expandId: params.expandId,
      orgunitId: params.orgunitId,
    };
    this.serverDate = params.serverDate;
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
        <DialogBox ref={(dialogbox) => { this.dialogbox = dialogbox; }} />
        <CustomDatePicker
          date={this.serverDate}
          parent={this}
          flag="garden"
          refresh={'GardenPerformance'}
          ref={(customDatePicker) => { this.customDatePicker = customDatePicker; }}
        />
        <ScrollView>
          <ReformSwiper parent={this} who="THIS_GARDEN" refresh={'GardenPerformance'} />
          <FunnelChartData parent={this} refresh={'GardenPerformance'} />
          <RecognizeChartData parent={this} refresh={'GardenPerformance'} />
          <ProjectMemberList
            expandId={this.props.navigation.state.params.expandId}
          />
          <PieChartData parent={this} who="THIS_GARDEN" refresh={'GardenPerformance'} />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({

  headerTitle: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    marginTop: 10,
    height: screen.height - 60,
    backgroundColor: '#fff',
  },
  // tab底线
  lineStyle: {
    height: 3,
    backgroundColor: '#ffc601',
  },
  marginL: {
    marginLeft: 4,
  },
});
