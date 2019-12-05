import React, { Component } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Text,
} from 'react-native';
// import Separator from './Separator';
import Icon from '../../components/Icon/';
import { system } from '../../utils';

const { width, height } = Dimensions.get('window');
const dialogH = 264;
let paddingTop = 25;
if (system.isIphoneX) {
  paddingTop = 15;
} else if (system.isIphoneXs) {
  paddingTop = 15;
}
class ShareAlertDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isVisible: this.props.show,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ isVisible: nextProps.show });
  }


  closeModal() {
    this.setState({
      isVisible: false,
    });
    this.props.closeModal(false);
  }
  // 分享到微信
  shareWx() {
    this.closeModal();
    this.props.parent.openShare('wx');
  }
  // 分享到短信
  shareDx() {
    this.closeModal();
    this.props.parent.openShare('dx');
  }
  renderDialog() {
    return (
      <View style={styles.modalStyle}>
        <View style={styles.inner}>
          <TouchableOpacity style={styles.item} onPress={() => { this.shareWx(); }}>
            <Icon name="weixin" size={64} color="#42ba72" />
            <Text style={styles.txt}>微信</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => { this.shareDx(); }}>
            <Icon name="duanxin" size={64} color="#7aaede" />
            <Text style={styles.txt}>短信</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.container}
          activeOpacity={1}
          onPress={() => this.closeModal()}
        >
          <View style={styles.cancelBtn}>
            <Text style={styles.cancelTxt}>取消</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    return (
      <View>
        <Modal
          transparent
          visible={this.state.isVisible}
          animationType={'fade'}
          onRequestClose={() => this.closeModal()}
        >
          <View
            style={styles.container}
            activeOpacity={1}
          >
            {this.renderDialog()}
          </View>
        </Modal>
      </View >
    );
  }
}

export default ShareAlertDialog;

const styles = StyleSheet.create({
  container: {
    height,
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  inner: {
    flexDirection: 'row',
    height: 180,
    paddingHorizontal: 15,
  },
  modalStyle: {
    position: 'absolute',
    // top: height - 264,
    bottom: 0,
    left: 0,
    width,
    backgroundColor: '#ffffff',
    height: system.isIphoneX ? dialogH + 15 : dialogH,
    paddingTop: 40,

  },
  item: {
    width: 65,
    marginRight: 30,
    height: 90,
    backgroundColor: '#ffffff',
  },
  txt: {
    fontSize: 14,
    color: '#7e7e7e',
    marginTop: 5,
    textAlign: 'center',
  },
  cancelBtn: {
    backgroundColor: '#e8e8ea',
    height: system.isIphoneX ? 44 + 15 : 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: paddingTop,
  },
  cancelTxt: {
    fontSize: 18,
    color: '#3a3a3a',
  },
});
