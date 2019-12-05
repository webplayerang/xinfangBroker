import React, { PureComponent } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  FlatList,
  DeviceEventEmitter,
} from 'react-native';
import axios from 'axios';
import GoBack from '../../components/GoBack';
import { screen } from '../../utils';

export default class ImageTemplate extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: '图库模板',
    headerLeft: (<GoBack navigation={navigation} />),
    headerRight: (<Text />),
  });

  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }

  componentDidMount () {
    axios.get('/expand/report/getTemplate', { params: { type: this.props.navigation.state.params.type } })
      .then((res) => {
        if (res.data.status === 'C0000') {
          this.setState({ data: res.data.result });
        }
      }).catch(() => []);
  }

  renderItem = (item) => {
    const navigation = this.props.navigation;
    return (<TouchableOpacity
      key={item.item.index}
      style={{ width: (screen.width - 15) / 2, marginRight: 5 }}
      onPress={() => {
        DeviceEventEmitter.emit('UpdateImage', { fdfsUrl: item.item.saveUrl, path: item.item.showUrl.replace('{size}', '750x500') });
        navigation.goBack();
      }}
    >
      <Image source={{ uri: item.item.showUrl.replace('{size}', '1500x1000') }} style={styles.image} resizeMode="cover" />
    </TouchableOpacity>);
  }

  render () {
    const navigation = this.props.navigation;

    return (
      <FlatList
        style={styles.container}
        renderItem={this.renderItem}
        refreshing={false}
        onEndReachedThreshold={0}
        columnWrapperStyle={{ padding: 5 }}
        numColumns={2}
        keyExtractor={(item, index) => index.toString()}
        data={this.state.data}
      />);
  }
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f9',
    flex: 1,
  },
  image: {
    width: (screen.width - 15) / 2,
    height: 300,
  },
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

});
