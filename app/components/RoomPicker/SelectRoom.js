import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  DeviceEventEmitter,
} from 'react-native';
import axios from 'axios';
import Toast, { DURATION } from 'react-native-easy-toast';
import { screen } from '../../utils/';
import GoBack from '../GoBack';
import StatusView from '../StatusView';

export default class SelectRoom extends React.PureComponent {
  static navigationOptions = ({ navigation }) => ({
    title: '选择房号',
    headerLeft: <GoBack navigation={navigation} />,
    headerRight: <Text />,
  });

  state = { data: [], isLoading: true };

  componentWillMount() {
    const { params } = this.props.navigation.state;
    this.getDataByUrl(params);
  }

  async getDataByUrl(params) {
    const data = await axios
      .get('/common/rooms', {
        params: {
          expandId: params.expandId,
          unitId: params.unitId,
        },
      })
      .then((res) => {
        this.setState({ isLoading: false });
        if (res.data.status === 'C0000') {
          return res.data.result;
        }
        return null;
      });
    this.setState({ data });
  }

  renderLeftItem(item) {
    return (
      <View style={[styles.floorWrapper]}>
        <Text style={styles.floorTitle}>{item.item.floorName}</Text>
      </View>
    );
  }

  render() {
    const { state, goBack } = this.props.navigation;

    let floorScrollView;
    if (this.state.isLoading) {
      return <StatusView />;
    }

    return (
      <View style={[styles.container]}>
        <View style={styles.titleWrapper}>
          <View style={styles.textWrapper}>
            <Text style={styles.title}>楼层</Text>
            <Text style={styles.title}>房号</Text>
          </View>
          <View style={styles.statusWrapper}>
            <View style={[styles.status, styles.unuse]} />
            <Text style={styles.title}>可售房</Text>
            <View style={[styles.status, styles.used]} />
            <Text style={styles.title}>已售房</Text>
          </View>
        </View>
        {this.state.data.length ? (
          <View style={styles.contentWrapper}>
            <ScrollView
              style={styles.leftPannel}
              showsVerticalScrollIndicator={false}
              ref={(scrollView) => {
                floorScrollView = scrollView;
              }}
              scrollEventThrottle={200}
            >
              {this.state.data.map((item) => (
                <View key={item.floorId} style={[styles.floorWrapper]}>
                  <Text style={styles.floorTitle}>{item.floorName}</Text>
                </View>
              ))}
            </ScrollView>

            <ScrollView
              style={styles.rightPannel}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={200}
              onScroll={(e) => {
                floorScrollView.scrollTo({
                  y: e.nativeEvent.contentOffset.y,
                });
              }}
            >
              {this.state.data.map((item) => (
                <ScrollView
                  key={item.floorId}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{
                    borderBottomColor: '#e7e8ea',
                    borderBottomWidth: StyleSheet.hairlineWidth,
                  }}
                >
                  {item.rooms.length > 0 ? (
                    item.rooms.map((val) => (
                      <TouchableOpacity
                        key={val.roomId}
                        style={[
                          styles.roomWrapper,
                          val.soldOut ? { backgroundColor: '#e8e8ea' } : null,
                        ]}
                        onPress={() => {
                          if (val.soldOut) {
                            this.refs.toast.show('该房已售，请重新选择');
                          } else {
                            const desc = `${state.params.value}-${
                              item.floorName
                            }-${val.roomNumber}`;
                            DeviceEventEmitter.emit('RoomNumber', {
                              area: val.area,
                              roomId: val.roomId,
                              roomNumber: val.roomNumber,
                              desc,
                            });
                            goBack(state.params.key);
                          }
                        }}
                      >
                        <Text style={styles.roomTitle}>{val.roomNumber}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <TouchableOpacity style={[styles.roomWrapper]}>
                      <Text style={styles.roomTitle}>暂无</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              ))}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.noData}>
            <Text>暂无数据</Text>
          </View>
        )}
        <Toast ref="toast" positionValue={screen.height / 2} opacity={0.7} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: screen.width,
    flexDirection: 'column',
    backgroundColor: '#f5f5f9',
  },
  noData: {
    height: screen.height - 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrapper: {
    backgroundColor: '#fff',
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 10,
    marginTop: 20,
  },
  textWrapper: {
    flexDirection: 'row',
    paddingLeft: 10,
  },
  statusWrapper: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7e7e7e',
    marginLeft: 5,
  },
  status: {
    width: 13,
    height: 13,
    borderColor: '#a8a8a8',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 3,
    marginLeft: 10,
  },
  unuse: {
    backgroundColor: '#fff',
  },
  used: {
    backgroundColor: '#e8e8ea',
  },
  contentWrapper: {
    width: screen.width,
    height: screen.height - 142,
    flexDirection: 'row',
    borderTopColor: '#a8a8a8',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  leftPannel: {
    width: 55,
    borderRightColor: '#a8a8a8',
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  rightPannel: {
    width: screen.width - 55,
    // backgroundColor: '#fff',
  },
  floorWrapper: {
    height: 55,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: '#e7e8ea',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  floorTitle: {
    fontSize: 16,
    color: '#7e7e7e',
  },
  roomWrapper: {
    width: 58,
    height: 55,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightColor: '#e7e8ea',
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  roomTitle: {
    fontSize: 16,
    color: '#3a3a3a',
  },
});
