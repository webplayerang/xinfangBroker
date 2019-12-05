

import React, { PureComponent } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import GoBack from '../../components/GoBack';
import { screen } from '../../utils';
import BaseStyles from '../../style/BaseStyles';

export default class GardenPerformance extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    return {
      headerTitle: (
        <TouchableOpacity
          style={styles.headerTitle}
          onPress={() => {
            params.filterViewShow();
          }}
        >
          <Text style={BaseStyles.headerTitleText}>{params.defaultTitle}</Text>
          {
            params.triangleDirection ?
              <View style={[BaseStyles.triangleUp, { marginLeft: 5 }]} />
              :
              <View style={[BaseStyles.triangleDown, { marginLeft: 5 }]} />
          }
        </TouchableOpacity >
      ),
      headerRight: (
        <Text />
      ),
      headerLeft: (
        <GoBack
          navigation={navigation}
        />
      ),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      filterViewShow: true,
      inconName: false,
      filerData: ['全部楼盘', '楼盘1', '楼盘2', '楼盘3'],
    };
  }
  componentDidMount() {
    // 在static navigationOptions中使用this方法
    this.props.navigation.setParams({
      filterViewShow: this.filterViewShow.bind(this),
    });
  }
  filterViewShow() {
    this.setState({
      filterViewShow: !this.state.filterViewShow,
    });
    this.props.navigation.setParams({
      triangleDirection: !this.props.navigation.state.params.triangleDirection,
    });
  }

  fliterviewEle() {
    if (this.state.filterViewShow) {
      return null;
    }
    return (
      <View style={styles.hehe}>
        <ScrollView style={{ width: '100%' }}>
          <View style={{
            width: '100%',
            backgroundColor: 'pink',
            zIndex: 999,
            paddingVertical: 10,
          }}
          >
            {
              this.state.filerData.map((val) => (
                <TouchableOpacity
                  key={Math.random()}
                  style={{
                    height: 60, width: '100%', justifyContent: 'center', alignItems: 'center',
                  }}
                  onPress={() => {
                    this.filterViewShow();
                    this.props.navigation.setParams({
                      defaultTitle: val,
                      // triangleDirection: !this.props.navigation.state.params.triangleDirection,
                    });
                  }}
                >
                  <Text>{val}</Text>
                </TouchableOpacity>
              ))
            }
          </View>
          <TouchableOpacity
            style={{
              width: '100%',
              backgroundColor: 'blue',
              opacity: 0.1,
              position: 'absolute',
              top: 0,
              zIndex: 998,
              height: screen.height - 60,
            }}
            onPress={() => {
              this.filterViewShow();
              this.props.navigation.setParams({
                triangleDirection: !this.props.navigation.state.params.triangleDirection,
              });
            }}
          />
        </ScrollView>

      </View>
    );
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.fliterviewEle()}
      </View>

    );
  }
}

const styles = StyleSheet.create({
  hehe: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: screen.height - 60,
    // backgroundColor: '#999',
    // opacity: 1,
    zIndex: 900,
    alignItems: 'center',
  },
  headerTitle: {
    width: '100%',
    flexDirection: 'row',
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

