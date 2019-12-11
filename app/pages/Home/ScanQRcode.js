
import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import axios from 'axios';
import Toast from 'react-native-easy-toast';
import Barcode from 'react-native-smart-barcode';
import GoBack from '../../components/GoBack';

export default class ScanQRcode extends Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: '带看扫码',
    headerLeft: (
      <GoBack
        navigation={navigation}
      />
    ),
    headerRight: <View />,
  });
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount () {

  }

  //  识别二维码
  onBarCodeRead = (e) => {
    const { navigate } = this.props.navigation;
    const { data } = e.nativeEvent;
    this.barCode.stopScan();
    if (data.code) {
      data.source = 'QrCode';
      const reservationId = data.code.split('=')[1] || '';
      data.reservationId = reservationId;
      axios.get('reservation/guideConfirm',
        {
          params: {
            reservationId,
            guideStatus: 'YES',
            qrcode: true,
          },
        },
      ).then((res) => {
        if (res.data.status === 'C0000') {
          navigate('ReportDetail', data);
        } else {
          this.refs.toast.show(res.data.message || '未获取到带看状态，请重新扫码');
        }
      }).catch((err) => {
        this.refs.toast.show(err.message || '未获取到带看状态，请重新扫码');
      });
    } else {
      this.refs.toast.show('二维码异常');
    }
  };

  render () {
    return (
      <View style={styles.container}>
        <Barcode
          ref={(ref) => { this.barCode = ref; }}
          style={{ flex: 1 }}
          scannerLineInterval={1500}
          onBarCodeRead={this.onBarCodeRead}
        />
        <Toast ref="toast" position="center" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
});
