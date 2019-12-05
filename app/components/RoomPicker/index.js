import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import { screen } from '../../utils/';
import GoBack from '../GoBack';

export default class RoomPicker extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: '选择房号',
    headerLeft: <GoBack navigation={navigation} />,
    headerRight: <Text />,
  });

  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
    this.renderGarden = this.renderGarden.bind(this);
    this.renderGardenAndUnits = this.renderGardenAndUnits.bind(this);
  }

  componentWillMount() {
    this.getDataByUrl();
  }

  async getDataByUrl() {
    const { params } = this.props.navigation.state;
    const data = await axios
      .get('/common/buildingUnits', {
        params: {
          expandId: params.expandId,
        },
      })
      .then((res) => {
        if (res.data.status === 'C0000') {
          return res.data.result;
        }
        return null;
      });
    this.setState({ data });
  }

  renderGarden(el) {
    const { state } = this.props.navigation;
    return (
      <View style={styles.unitWrapper} key={el.buildingId}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => {
            this.props.navigation.navigate('SelectRoom', {
              key: state.key,
              expandId: state.params.expandId,
              unitId: el.buildingId,
              value: `${el.buildingName}`,
            });
          }}
        >
          <Text style={styles.unit}>{el.buildingName}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderGardenAndUnits(el) {
    const { state } = this.props.navigation;
    return (
      <View>
        <View style={styles.floorWrapper}>
          <Text style={styles.floorTitle}>{el.buildingName}</Text>
        </View>
        {el.units.map((ele) => (
          <View style={styles.unitWrapper} key={ele.unitId}>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => {
                this.props.navigation.navigate('SelectRoom', {
                  key: state.key,
                  expandId: state.params.expandId,
                  unitId: ele.unitId,
                  value: `${el.buildingName}-${ele.unitName}`,
                });
              }}
            >
              <Text style={styles.unit}>{ele.unitName}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  }

  render() {
    return (
      <ScrollView style={[styles.container]}>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>选择楼栋:</Text>
        </View>
        {
          this.state.data.map((el) => (
            <View key={Math.random()}>
              {
                !el.units.length
                  ? this.renderGarden(el)
                  : this.renderGardenAndUnits(el)
              }
            </View>
          ))
        }
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: screen.width,
    backgroundColor: '#fff',
  },
  titleWrapper: {
    height: 58,
    justifyContent: 'center',
    paddingLeft: 23,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3a3a3a',
  },
  floorWrapper: {
    height: 45,
    backgroundColor: '#f2f2f6',
    paddingLeft: 15,
    justifyContent: 'center',
  },
  floorTitle: {
    fontSize: 16,
    color: '#7e7e7e',
  },
  unitWrapper: {
    paddingHorizontal: 15,
  },
  btn: {
    height: 45,
    backgroundColor: '#fff',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e7e8ea',
  },
  unit: {
    fontSize: 16,
    color: '#333',
  },
});
