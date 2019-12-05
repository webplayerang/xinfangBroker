import React, { PureComponent } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Text,
  ActivityIndicator,
  Image,
  InteractionManager,
  ScrollView,
  DeviceEventEmitter,
} from 'react-native';
import axios from 'axios';
import ImagePicker from 'react-native-image-crop-picker';
import Toast from 'react-native-easy-toast';
import Icon from '../../components/Icon/';
import GoBack from '../../components/GoBack';
import { screen, system } from '../../utils';

export default class ReleaseReport extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;
    const type = {
      CJXX: '成交喜讯',
      YHJL: '优惠奖励',
      SPTG: '笋盘推荐',
    };
    return {
      headerTitle: type[params.type],
      headerRight: (
        <TouchableOpacity
          style={{ paddingRight: 15 }}
          onPress={() => {
            params.report();
          }}
        >
          <Text>发布</Text>
        </TouchableOpacity>
      ),
      headerLeft: (
        <GoBack navigation={navigation} />
      ),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedImages: [],
      fdfsUrl: [],
      show: false,
      loading: false,
      submit: false,
    };
    this.selectCamera = this.selectCamera.bind(this);
    this.uploadImage = this.uploadImage.bind(this);
    this.deleteImage = this.deleteImage.bind(this);
    this.hideButton = this.hideButton.bind(this);
  }

  componentDidMount() {
    const navigation = this.props.navigation;
    navigation.setParams({
      report: this.report.bind(this),
    });

    DeviceEventEmitter.addListener('UpdateImage', (item) => {
      this.setState({
        selectedImages: [].concat(this.state.selectedImages.concat(item)),
      });
    });
  }

  report() {
    if (!this.state.submit) {
      this.uploadImage();
    }
  }

  hideButton() {
    this.setState({ show: false });
  }

  async uploadImage() {
    const { params } = this.props.navigation.state;

    if (!this.state.title) {
      this.refs.toast.show('战报标题不能为空！');
      return;
    }
    this.setState({ submit: true, loading: true });
    const data = { expandName: params.gardenName, templateType: params.type, expandId: params.expandId, title: this.state.title };
    const selectedImages = this.state.selectedImages;
    if (selectedImages.length) {
      const photos = [];
      for (let k = 0; k < selectedImages.length; k++) {
        const ele = selectedImages[k];
        if (ele.fdfsUrl) {
          photos.push(ele.fdfsUrl);
        } else {
          // 通过拍照上传
          const fileName = ele.path.substring(ele.path.lastIndexOf('/') + 1, ele.path.length);

          const formData = new FormData();
          const file = {
            uri: ele.path, type: 'multipart/form-data', name: fileName,
          }; // 这里的key(uri和type和name)不能改变,
          formData.append('file', file); // 这里的files就是后台需要的key

          // 请求头文件
          const config = {
            Accept: 'Application/json',
            'Content-Type': 'multipart/form-data',
          };

          const result = await axios.post('/pub/service/upload/image', formData, config).then((res) => res.data);
          if (result.status === 'C0000') {
            photos.push(result.result.fdfsUrl);
          } else {
            this.refs.toast.show(result.message);
            this.setState({ submit: false, loading: false });
            return;
          }
        }
      }
      data.photos = photos.join(',');
    }

    // 发布
    axios
      .post('/expand/report/save', data)
      .then((res) => {
        if (res.data.status === 'C0000') {
          this.refs.toast.show('发布成功!');
          DeviceEventEmitter.emit('RefreshReleaseList');
          setTimeout(() => {
            if (params.reservationId) {
              this.props.navigation.goBack(params.key);
              this.setState({ submit: false, loading: false });
            } else {
              this.props.navigation.goBack();
              this.setState({ submit: false, loading: false });
            }
          }, 1500);
        } else {
          this.setState({ submit: false, loading: false });
          this.refs.toast.show(res.data.message);
        }
      });
  }

  selectCamera() {
    if (this.state.selectedImages.length >= 9) {
      this.refs.toast.show('最多只能添加9张图片');
      return;
    }
    InteractionManager.runAfterInteractions(() => {
      // 拍照
      ImagePicker.openCamera({
        mediaType: 'photo',
        maxFiles: 9 - this.state.selectedImages.length,
        compressImageQuality: system.isIOS ? 0 : 1,
      }).then((image) => {
        this.setState({ selectedImages: [].concat(this.state.selectedImages.concat(image)) });
      });
    });
  }


  pickImage() {
    if (this.state.selectedImages.length >= 9) {
      this.refs.toast.show('最多只能添加9张图片');
      return;
    }
    ImagePicker.openPicker({
      multiple: true,
      maxFiles: 9 - this.state.selectedImages.length,
      loadingLabelText: '加载中...',
      mediaType: 'photo',
      compressImageQuality: system.isIOS ? 0 : 1,
    }).then((image) => {
      this.setState({ selectedImages: [].concat(this.state.selectedImages.concat(image)) });
    });
  }


  deleteImage(index) {
    this.state.selectedImages.splice(index, 1);
    this.setState({
      selectedImages: [].concat(this.state.selectedImages),
    });
  }


  renderImageRow(arr, start, end, isSecondRow) {
    const images = [];
    for (let i = start; i < end; i++) {
      images.push(this.renderImageItem(arr[i], i));
    }
    images.push(this.renderAddBtn());
    let style = {};
    if (!isSecondRow) {
      style = { flexDirection: 'row' };
    } else {
      style = { flexDirection: 'row', marginTop: 10 };
    }
    return (
      <View key={`imageRow${end}`} style={style}>
        {images}
      </View>
    );
  }


  renderAddBtn() {
    return (
      <TouchableOpacity
        style={{
          width: (screen.width - 30) / 3,
          height: (screen.width - 30) / 3,
          borderWidth: 1,
          borderColor: '#e7e8ea',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        key={'addBtn'}
        activeOpacity={0.6}
        onPress={() => {
          this.setState({ show: true });
        }}
      >
        <Icon name="plus" color="#e7e8ea" size={80} />
      </TouchableOpacity>
    );
  }

  renderSelectedImages() {
    const row1 = [];
    const row2 = [];
    const row3 = [];
    const images = this.state.selectedImages;
    const len = images.length;
    if (len >= 0 && len <= 2) {
      row1.push(this.renderImageRow(images, 0, len, false));
    } else if (len > 2 && len < 6) {
      row1.push(this.renderImageRow(images, 0, 3, false));
      row2.push(this.renderImageRow(images, 3, 6, true));
    } else {
      row1.push(this.renderImageRow(images, 0, 3, false));
      row2.push(this.renderImageRow(images, 3, 6, true));
      row3.push(this.renderImageRow(images, 6, 9, true));
    }
    return (
      <View style={styles.selectedImageContainer}>
        {row1}
        {row2}
        {row3}
      </View>
    );
  }

  renderImageItem(item, index) {
    if (item) {
      const imageURI = { uri: item.path };
      return (
        <View key={`imageItem${index}`}>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => {
              this.deleteImage(index);
            }}
            style={{
              width: 24,
              height: 24,
              borderColor: '#fff',
              borderWidth: 1,
              borderRadius: 13,
              alignItems: 'center',
              justifyContent: 'center',
              right: 10,
              top: 5,
              backgroundColor: '#f91',
              zIndex: 11111,
              position: 'absolute',
            }}
          >
            <Icon name="delete" color="#fff" size={12} />
          </TouchableOpacity>
          <Image source={imageURI} style={styles.addPicImgBtn} />
        </View>
      );
    }
    return null;
  }

  render() {
    const navigation = this.props.navigation;
    const gardenName = navigation.state.params.gardenName;
    return (
      <View style={styles.container}>
        <ScrollView >
          <View style={styles.gardenName}>
            <Text style={styles.name}>
              楼盘登记名 ：
            </Text>
            <Text style={styles.value}>
              {gardenName.length > 20 ? `${gardenName.substring(0, 15)}...` : gardenName || ''}
            </Text>
          </View>
          <View style={{ paddingHorizontal: 10, marginBottom: 10 }}><Text style={{ fontSize: 12, color: '#a8a8a8' }}>发布将推送已报备和关注的经纪人，新房通APP战报实况可查看</Text></View>
          <View style={styles.titleWrapper}>
            <View style={styles.flag} />
            <View style={styles.header}>
              <Text style={styles.title}>内容:</Text>
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="请输入内容文字"
              maxLength={100}
              multiline
              onChangeText={(title) => this.setState({ title })}
              value={this.state.title}
            />
          </View>
          <View style={[styles.titleWrapper, { flex: 3, paddingBottom: 40 }]}>
            <View style={styles.flag} />
            <View style={styles.header}>
              <Text style={styles.title}>插图:</Text>
              <TouchableOpacity onPress={() => {
                this.setState({
                  fdfsUrl: [],
                  selectedImages: [],
                });
              }}
              >
                <Icon name="lajitong" color="#848484" size={18} style={{ marginRight: 20 }} />
              </TouchableOpacity>
            </View>
            {this.renderSelectedImages()}
          </View>

          <Toast ref="toast" position="center" opacity={0.7} />
        </ScrollView>
        {
          this.state.loading ? (
            <View
              style={[{
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#999',
                opacity: 0.6,
                width: screen.width,
                height: screen.height,
                position: 'absolute',
              }]}
            >
              <ActivityIndicator size="large" color="#fff" />
              <Text style={{ marginTop: 5, color: '#fff' }}>正在发布中，请耐心等待...</Text>
            </View>) : null
        }
        {this.state.show ? (
          <TouchableOpacity
            style={styles.parentWrapper}
            onPress={() => {
              this.hideButton();
            }}
          >
            <View style={styles.btnContainer}>
              <TouchableOpacity
                style={styles.btnDialog}
                onPress={() => {
                  navigation.navigate('ImageTemplate', { type: navigation.state.params.type });
                  this.hideButton();
                }}
              >
                <Text style={styles.textDialog}>从图库选取</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnDialog, styles.line]}
                onPress={() => {
                  this.selectCamera();
                  this.hideButton();
                }}
              >
                <Text style={styles.textDialog}>拍照</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnDialog, styles.line]}
                onPress={() => {
                  this.pickImage();
                  this.hideButton();
                }}
              >
                <Text style={styles.textDialog}>从手机相册选取</Text>
              </TouchableOpacity>
            </View></TouchableOpacity>) : null}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f9',
    flex: 1,
  },
  gardenName: {
    flexDirection: 'row',
    paddingLeft: 15,
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginTop: 10,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    color: '#a8a8a8',
  },
  value: {
    fontSize: 16,
    color: '#3a3a3a',
  },
  titleWrapper: {
    backgroundColor: '#fff',
    paddingLeft: 10,
    marginBottom: 10,
  },
  header: {
    height: 55,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  flag: {
    width: 5,
    height: 40,
    position: 'absolute',
    top: 2,
    left: 0,
    backgroundColor: '#ffc601',
  },
  title: {
    color: '#000',
    fontSize: 18,
  },
  textInput: {
    fontSize: 16,
    padding: 10,
    marginRight: 10,
    height: 120,
    color: '#3a3a3a',
    borderColor: '#e7e8ea',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 5,
    marginBottom: 10,
  },
  text: {
    marginTop: 15,
    fontSize: 16,
    color: '#a8a8a8',
  },
  selectedImageContainer: {
    width: screen.width,
    flexDirection: 'column',
  },
  addPicImgBtn: {
    width: (screen.width - 30) / 3,
    height: (screen.width - 30) / 3,
    marginRight: 5,
  },
  parentWrapper: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: 'rgba(52, 52, 52, 0.5)',
  },
  btnContainer: {
    width: screen.width,
    position: 'absolute',
    bottom: 0,
    borderColor: '#dedfe0',
    borderWidth: StyleSheet.hairlineWidth,
  },
  btnDialog: {
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#f6f5fa',
  },
  line: {
    borderTopColor: '#dedfe0',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  textDialog: {
    color: '#7e7e7e',
    fontSize: 18,
  },
});
