import React, { PureComponent } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  InteractionManager,
  ActivityIndicator,
  DeviceEventEmitter,
} from 'react-native';
import axios from 'axios';
import Icon from '../../components/Icon/';
import GardenRenderItem from './GardenRenderItem';

export default class PerforGardenList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      isMore: false,
      loading: true,
    };
    this.more = false;
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.requestData();
    });
    this.listener = DeviceEventEmitter.addListener('CountryPerformance', () => {
      this.requestData();
    });
  }


  componentWillUnmount() {
    this.listener.remove();
  }

  onSelect(item) {
    const { parent } = this.props;
    // 跳转楼盘战报
    const params = {
      serverDate: parent.serverDate,
      orgunitId: parent.filterParams.orgunitId,
    };
    Object.assign(params, item);
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate('GardenPerformance', params);
    });
  }

  requestData() {
    axios.get('companyStatistics/getGardenPagination', {
      params: { orgunitId: this.props.parent.filterParams.orgunitId },
    })
      .then((res) => {
        if (res.data.status === 'C0000') {
          const data = res.data.result.items;
          if (data.length > 5) {
            data = data.splice(0, 5);
            this.setState({
              isMore: true,
              data,
              loading: false,
            });
          } else {
            this.setState({
              isMore: false,
              data,
              loading: false,
            });
          }
          return;
        }
        this.setState({
          data: [],
          loading: false,
        });
      })
      .catch((err) => {
        this.setState({
          data: [],
          loading: false,
        });
      });
  }


  render() {
    if (this.state.loading) {
      return (<ActivityIndicator
        style={[{ height: 75, backgroundColor: 'transparent', transform: [{ scale: 1.2 }] }]}
        size="large"
        color="#ccc"
        animating
      />);
    }
    const data = this.state.data;
    return (
      <View style={{
        borderTopColor: '#e7e8ea',
        borderTopWidth: StyleSheet.hairlineWidth,
      }}
      >
        {
          data.map((val) => (
            <TouchableOpacity
              key={Math.random()}
              onPress={() => {
                this.onSelect(val);
              }}
            >
              <GardenRenderItem
                item={val}
              />
            </TouchableOpacity>
          ))
        }
        {this.state.isMore && (
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => {
              this.props.navigation.navigate('PerforGardenAll',
                {
                  who: this.props.navigation.state.params.who,
                  defaultTitle: this.props.navigation.state.params.defaultTitle,
                  filterData: this.props.filterData,
                  orgunitId: this.props.parent.filterParams.orgunitId,
                  serverDate: this.props.parent.serverDate,
                });
            }}
          >
            <Text style={{ fontSize: 12 }}>更多</Text>
            <Icon name="arrow-right" size={10} color="#f91" />
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  moreButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
});
