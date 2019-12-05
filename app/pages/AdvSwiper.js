import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import Swiper from 'react-native-swiper';
import { screen } from '../utils';

export default class AdvSwiper extends React.Component {
  static navigationOptions = {
    header: null,
  };
  constructor(props) {
    super(props);
    this.state = { listAdv: [] };
    this.getListAdv = this.getListAdv.bind(this);
  }

  componentDidMount() {
    this.getListAdv();
  }

  getListAdv() {
    axios.get('/ad/getAdByPostion', {
      params: {
        brokerAppPosition: 'FullScreenInterface',
      },
    }).then((res) => {
      if (res.data.status === 'C0000' && res.data.result.picFdfsUrls.length > 0) {
        this.setState({
          listAdv: res.data.result.picFdfsUrls,
        });
      } else {
        this.props.navigation.navigate('Login');
      }
    });
  }
  render() {
    return (
      <View style={styles.container}>
        {this.state.listAdv.length > 0 ? (<Swiper
          style={styles.wrapper}
          dot={<View style={{ backgroundColor: 'rgba(255,255,255,.3)', width: 10, height: 10, borderRadius: 7, marginLeft: 7, marginRight: 7 }} />}
          activeDot={<View style={{ backgroundColor: '#fff', width: 10, height: 10, borderRadius: 7, marginLeft: 7, marginRight: 7 }} />}
          paginationStyle={{
            bottom: 50,
          }}
          loop={false}
        >
          {
            this.state.listAdv.map((ele, index) => {
              ele = ele.replace('{size}', `${screen.width}x${screen.height}`);
              if (index + 1 !== this.state.listAdv.length) {
                return (<View style={styles.slide} key={Math.random()}>
                  <Image
                    style={styles.image}
                    source={{ uri: ele }}
                    resizeMode="cover"
                  />
                </View>);
              } return (<View style={styles.slide} key={Math.random()}>
                <Image style={styles.image} source={{ uri: ele }} resizeMode="cover" />
                <TouchableOpacity
                  onPress={() => {
                    global.storage.save({
                      key: 'adv',
                      data: true,
                      expires: null,
                    });
                    this.props.navigation.navigate('Login');
                  }}
                  style={{ alignItems: 'center', justifyContent: 'center', left: '50%', marginLeft: -30, bottom: 100, width: 60, height: 30, zIndex: 111, position: 'absolute' }}
                >
                  <Text style={{ fontSize: 20, color: '#fff' }}>登 录</Text>
                </TouchableOpacity>
              </View>);
            })
          }
        </Swiper>) : null}
      </View >
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    // backgroundColor: '#fff',
  },

  slide: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
  },
  image: {
    width: screen.width,
    height: screen.height,
  },
});
