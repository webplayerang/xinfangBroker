import React, { PureComponent } from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  DeviceEventEmitter,
} from 'react-native';
import axios from 'axios';

import ImagePicker from 'react-native-image-crop-picker';
import Video from 'react-native-af-video-player';
import Toast from 'react-native-easy-toast';
import Icon from '../../components/Icon';
import { screen, system } from '../../utils';
import BaseStyles from '../../style/BaseStyles';
import TextPackage from '../../components/TextPackage';

class AddDynamic extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      headerTitle: '添加动态',
      headerLeft: (
        <TouchableOpacity
          style={{ paddingLeft: 15 }}
          onPress={() => params.onGoBack()}
        >
          <Icon name="navigate-go-back" size={20} color="#333" />
        </TouchableOpacity>
      ),
      headerRight: (
        <TouchableOpacity
          style={{ paddingRight: 15 }}
          onPress={() => params.onGardenDynimic()}
        >
          <Text style={[BaseStyles.black, BaseStyles.text15]}>保存</Text>
        </TouchableOpacity>
      ),
    };
  };
  constructor(props) {
    super(props);
    this.state = {
      houseName: '',
      houseId: null,
      dynamicTypeStr: '',
      dynamicType: '',
      topFlag: 0,
      saleType: 'SELL',
      titleText: '',
      titleTextNum: 0,
      contentText: '',
      contentTextNum: 0,
      createDate: '',
      imgs: [],
      videos: [],
      videosLength: 0,
      imgsLength: 0,
      gardenDynamicAccessories: [], // 提交的附件数组
      isLoading: false,
      isLoadingVideo: false,
    };
    this.onConfirmTop = this.onConfirmTop.bind(this);
    this.onRentChoice = this.onRentChoice.bind(this);
    this.onSellChoice = this.onSellChoice.bind(this);
    this.onPickImage = this.onPickImage.bind(this);
    this.onPickVideo = this.onPickVideo.bind(this);
    this.toSearchHouse = this.toSearchHouse.bind(this);
    this.toDynamicType = this.toDynamicType.bind(this);
    this.repeatRequest = this.repeatRequest.bind(this);
    // this.toPhotoUrl = this.toPhotoUrl.bind(this);
    this.onDelImg = this.onDelImg.bind(this);
    this.onDelVideo = this.onDelVideo.bind(this);
    // this.onChangeCreateDate = this.onChangeCreateDate.bind(this);
  }


  componentDidMount() {
    const { props } = this;
    props.navigation.setParams({
      onGardenDynimic: this.onGardenDynimic.bind(this),
      onGoBack: this.onGoBack.bind(this),
    });
    this.HouseChoiceDevice = DeviceEventEmitter.addListener('EditDynamicChoiceHouseDevice', (item) => {
      this.setState({
        houseId: item.id,
        houseName: item.name,
      });
    });
    this.HouseChoiceDevice = DeviceEventEmitter.addListener('EditDynamicChoiceDynamicDevice', (item) => {
      this.setState({
        dynamicType: item.id,
        dynamicTypeStr: item.name,
      });
    });
  }
  onGoBack() {
    Alert.alert('确认退出', '', [
      {
        text: '确认',
        onPress: () => {
          const { props } = this;
          props.navigation.goBack();
        },
      },
      {
        text: '取消',
        onPress: () => {
        },
      },
    ]);
  }
  // 选择置顶框
  onConfirmTop() {
    const { topFlag } = this.state;
    if (topFlag) {
      this.setState({
        topFlag: 0,
      });
    } else {
      this.setState({
        topFlag: 1,
      });
    }
  }
  // 选择rent单选框

  onRentChoice() {
    this.setState({
      saleType: 'RENT',
    });
  }
  // 选择sell单选框
  onSellChoice() {
    this.setState({
      saleType: 'SELL',
    });
  }
  // title 文字改变时触发
  onChangeTitleText(text) {
    this.setState({
      titleText: text,
      titleTextNum: text.length,
    });
  }
  // 内容文字改变时触发
  onChangeCententText(text) {
    this.setState({
      contentText: text,
      contentTextNum: text.length,
    });
  }
  onGardenDynimic() {
    const {
      contentText,
      imgs,
      houseId,
      videos,
      titleText,
      dynamicType,
      topFlag,
      saleType,
      isLoading,
    } = this.state;
    if (isLoading) {
      return;
    }
    if (houseId === null) {
      this.toast.show('请选择楼盘');
      return;
    }
    if (contentText === '') {
      this.toast.show('请输入动态内容');

      return;
    }
    if (titleText === '') {
      this.toast.show('请输入动态标题');
      return;
    }
    if (dynamicType === '') {
      this.toast.show('请选择动态类型');
    }
    this.setState({
      isLoading: true,
    });
    axios.post('gardenDynimic/save', {
      content: contentText,
      expandId: houseId,
      gardenDynamicAccessories: imgs.concat(videos),
      saleType,
      title: titleText,
      topFlag,
      type: dynamicType,
    }).then((res) => {
      if (res.data.status === 'C0000') {
        this.toast.show('添加成功');
        setTimeout(() => {
          const { props } = this;
          DeviceEventEmitter.emit('AllDynamicList');
          DeviceEventEmitter.emit('MyDynamicList');
          props.navigation.goBack();
          this.setState({
            isLoading: false,
          });
        }, 1000);
      } else {
        this.toast.show(res.data.message);
        this.setState({
          isLoading: false,
        });
      }
    });
  }
  // onChangeCreateDate(text) {
  //   this.setState({
  //     createDate: text,
  //   });
  // }
  // 删除图片
  onDelImg(index, id) {
    const { imgs, imgsLength } = this.state;
    Alert.alert('确认删除', '', [
      {
        text: '确认',
        onPress: () => {
          this.delFile(id);
          imgs.splice(index, 1);
          this.setState({
            imgs,
            imgsLength: imgsLength - 1,
          });
        },
      },
      {
        text: '取消',
        onPress: () => {

        },
      },
    ]);
  }
  // 删除视频
  onDelVideo(id) {
    const { videos } = this.state;
    Alert.alert('确认删除', '', [
      {
        text: '确认',
        onPress: () => {
          this.delFile(id);
          videos.splice(0, 1);
          this.setState({
            videos,
            videosLength: 0,
          });
        },
      },
      {
        text: '取消',
        onPress: () => {

        },
      },
    ]);
  }


  // 打开相册选择视频
  onPickVideo() {
    ImagePicker.openPicker({
      multiple: true,
      maxFiles: 1,
      loadingLabelText: '加载中...',
      mediaType: 'video',
      compressImageQuality: system.isIOS ? 0 : 1,
    }).then((Videos) => {
      const size = Videos[0].size / 1021 / 1024;
      console.info(size, 888888);
      if (size >= 15) {
        this.toast.show('视频超过15M,不能上传');
      } else {
        const file = {
          uri: Videos[0].path,
          type: 'multipart/form-data',
          name: Videos[0].filename || 'video.MP4',
        };
        const formData = new FormData();
        formData.append('multipartFile', file);
        this.repeatRequestVideo(formData);
      }
    });
  }


  // 打开相册选择图片
  onPickImage() {
    const { imgs } = this.state;
    if (imgs.length >= 9) {
      this.toast.show('最多只能添加9张图片');
    } else {
      ImagePicker.openPicker({
        multiple: true,
        maxFiles: 9 - imgs.length,
        loadingLabelText: '加载中...',
        mediaType: 'photo',
        compressImageQuality: system.isIOS ? 0 : 1,
      }).then((images) => {
        if (imgs.length + images.length > 9) {
          this.toast.show('最多只能添加9张图片');
        } else {
          // 处理图片将图片处理成formData
          const fileList = images.map((item) => ({
            uri: item.path,
            type: 'multipart/form-data',
            name: item.filename || 'garden.jpg',
          }));
          const formDataList = [];
          fileList.forEach((item) => {
            const formData = new FormData();
            formData.append('multipartFile', item);
            formDataList.push(formData);
          });
          return this.repeatRequest(formDataList);
        }
      });
    }
  }

  delFile(id) {
    axios.post(`gardenDynimic/removeAccessory?id=${id}`).then((res) => {
      this.toast.show('删除成功');
    }).catch(() => {
      this.toast.show('删除失败');
    });
  }
  // 发送添加图片请求
  repeatRequest(allpromise) {
    const requestList = [];
    const config = {
      Accept: 'Application/json',
      'Content-Type': 'multipart/form-data',
    };
    allpromise.forEach((item) => {
      const requestItem = new Promise((resolve, reject) => {
        axios.post('pub/service/file/imgUpload', item, config).then((res) => {
          // 处理图片将发送成功的图片展示
          const { imgs, imgsLength } = this.state;
          const img = [];
          img.push({
            type: 'PICTURE',
            url: res.data.result.url,
          });
          this.setState({
            imgs: imgs.concat(img),
            imgsLength: imgsLength + 1,
          });
          resolve(res);
        }).catch((err) => {
          reject(err);
          this.toast.show('图片上传失败');
        });
      });
      requestList.push(requestItem);
    });
    return Promise.all(requestList).then(() => { }).catch(() => {
      this.toast.show('图片上传失败');
    });
  }
  // 发送添加视频请求
  repeatRequestVideo(formData) {
    const config = {
      Accept: 'Application/json',
      'Content-Type': 'multipart/form-data',
    };
    this.setState({
      isLoadingVideo: true,
    });
    axios.post('pub/service/file/fileUpload', formData, config).then((res) => {
      const { videos, videosLength } = this.state;
      const video = {
        type: 'VIDEO',
        url: res.data.result.url,
      };
      videos.push(video);
      this.setState({
        videos,
        videosLength: videosLength + 1,
        isLoadingVideo: false,
      });
    }).catch((err) => {
      this.setState({
        isLoadingVideo: false,
      });
      this.toast.show('视频上传失败');
    });
  }

  // 跳转搜索楼盘
  toSearchHouse() {
    const { props } = this;
    props.navigation.navigate('SearchMyHouse', {
      returnpageName: 'AddDynamic',
      deviceEventName: 'EditDynamicChoiceHouseDevice',
    });
  }// 跳转动态类型
  toDynamicType() {
    const { props } = this;
    props.navigation.navigate('DynamicType', {
      returnpageName: 'AddDynamic',
      deviceEventName: 'EditDynamicChoiceDynamicDevice',
    });
  }

  render() {
    const {
      houseName,
      dynamicTypeStr,
      topFlag,
      saleType,
      titleText,
      titleTextNum,
      contentText,
      contentTextNum,
      imgs,
      videos,
      isLoadingVideo,
      // createDate,
    } = this.state;
    return (
      <View>
        <ScrollView style={{ backgroundColor: '#fff' }} >
          <View style={styles.lineStyle} />
          <TouchableOpacity style={[styles.infoInnerBox, BaseStyles.borderBt]} onPress={this.toSearchHouse}>
            <View style={BaseStyles.rowStart}>
              <Text style={[BaseStyles.text15, BaseStyles.lightGray]}>楼盘推广名</Text>
            </View>
            <View style={BaseStyles.rowStart}>
              <TextPackage placeText="请选择" val={houseName} />
              <Icon name="arrow-right" color="#A8A8A8" size={14} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.infoInnerBox, BaseStyles.borderBt]} onPress={this.toDynamicType}>
            <View style={BaseStyles.rowStart}>
              <Text style={[BaseStyles.text15, BaseStyles.lightGray]}>动态类型</Text>
            </View>
            <View style={BaseStyles.rowStart}>
              <TextPackage placeText="请选择" val={dynamicTypeStr} />
              <Icon name="arrow-right" color="#A8A8A8" size={14} />
            </View>
          </TouchableOpacity>
          <View style={styles.lineStyle} />
          <View style={[styles.infoInnerBox, BaseStyles.borderBt]}>
            <View style={BaseStyles.rowStart}>
              <Text style={[BaseStyles.text15, BaseStyles.lightGray]}>销售类型</Text>
            </View>
            <View style={BaseStyles.rowStart}>
              <TouchableOpacity style={[BaseStyles.rowStart]} onPress={this.onSellChoice}>
                <View style={saleType === 'SELL' ? styles.seleTypeBoxTrue : styles.seleTypeBoxFalse} >
                  <View style={saleType === 'SELL' ? styles.seleTypeBoxCenter : null} />
                </View>
                <Text>售盘</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[BaseStyles.rowStart, { marginLeft: 10 }]} onPress={this.onRentChoice}>
                <View style={saleType === 'RENT' ? styles.seleTypeBoxTrue : styles.seleTypeBoxFalse} >
                  <View style={saleType === 'RENT' ? styles.seleTypeBoxCenter : null} />
                </View>
                <Text>租盘</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* <TouchableOpacity style={[styles.infoInnerBox, BaseStyles.borderBt]}>
          <View style={BaseStyles.rowStart}>
            <Text style={[BaseStyles.text15, BaseStyles.lightGray]}>上架日期</Text>
          </View>
          <MyDatePicker
            value={createDate}
            onChangeText={(text) => {
              this.onChangeCreateDate(text);
            }}
          />
        </TouchableOpacity> */}
          <View style={[styles.infoInnerBox, BaseStyles.borderBt]} >
            <View style={BaseStyles.rowStart}>
              <Text style={[BaseStyles.text15, BaseStyles.lightGray]}>动态置顶</Text>
            </View>
            <View style={BaseStyles.rowStart} >
              <Text style={[BaseStyles.text14, BaseStyles.colorCcc]}>（单个楼盘仅能置顶一条动态）</Text>
              <TouchableOpacity style={topFlag ? styles.topFlagBoxTrue : styles.topFlagBoxFalse} onPress={this.onConfirmTop}>
                <Icon name="gougou" color="#fff" size={14} />
              </TouchableOpacity>
            </View>
          </View >
          <View style={styles.lineStyle} />
          <View style={[BaseStyles.borderBottomHair, styles.titleStyle, BaseStyles.rowStart]}>
            <Text style={[BaseStyles.text15, BaseStyles.Color000]}>
              标题
            </Text>
          </View>
          <View style={{ paddingHorizontal: 15, paddingVertical: 10 }}>
            <TextInput
              style={[BaseStyles.text15, BaseStyles.black, { height: 50 }]}
              textAlignVertical="top"
              multiline
              maxLength={30}
              numberOfLines={2}
              onChangeText={(text) => this.onChangeTitleText(text)}
              value={titleText}
              placeholder="请输入标题内容"
              underlineColorAndroid="transparent"
            />
            <View style={BaseStyles.rowEnd}>
              <Text style={[BaseStyles.text14, BaseStyles.colorCcc]}>
                {titleTextNum}/30
              </Text>
            </View>
          </View>
          <View style={styles.lineStyle} />
          <View style={[BaseStyles.borderBottomHair, styles.titleStyle, BaseStyles.rowStart]}>
            <Text style={[BaseStyles.text15, BaseStyles.Color000]}>
              内容
            </Text>
          </View>
          <View style={{ paddingHorizontal: 15, paddingVertical: 10 }}>
            <TextInput
              style={[BaseStyles.text15, BaseStyles.black, { height: 100 }]}
              textAlignVertical="top"
              multiline
              maxLength={1000}
              onChangeText={(text) => this.onChangeCententText(text)}
              value={contentText}
              placeholder="请输入动态内容"
              underlineColorAndroid="transparent"
            />
            <View style={BaseStyles.rowEnd}>
              <Text style={[BaseStyles.text14, BaseStyles.colorCcc]}>
                {contentTextNum}/1000
              </Text>
            </View>
          </View>
          <View style={styles.lineStyle} />
          <View style={[BaseStyles.borderBottomHair, styles.titleStyle, BaseStyles.rowStart]}>
            <Text style={[BaseStyles.text15, BaseStyles.Color000]}>
              图片
            </Text>
          </View>
          <View style={{ paddingLeft: 15, paddingVertical: 15 }}>
            <View style={[styles.imagesBoxStyle, BaseStyles.rowStart]}>
              {
                imgs.map((item, index) => (
                  <View style={styles.imgBox} key={item.url}>
                    <TouchableOpacity
                      style={styles.chachaBox}
                      onPress={() => {
                        this.onDelImg(index, item.id);
                      }}
                    >
                      <Icon name="chacha" color="#999" size={12} />
                    </TouchableOpacity>
                    <Image
                      source={{ uri: item.url }}
                      style={imgs.length !== 4 ? styles.imagesStyle : styles.imagesFourStyle}
                    />
                  </View>
                ))
              }
            </View>
            <TouchableOpacity
              onPress={this.onPickImage}
              style={
                [
                  imgs.length !== 4 ? styles.imagesStyle : styles.imagesFourStyle,
                  BaseStyles.rowCenter,
                  { backgroundColor: '#F9F9F9' },
                ]
              }
            >
              {
                imgs.length > 9 ? (
                  <Text>只能选9张</Text>
                )
                  :
                  (
                    <Icon name="tianjia" color="#E5E5E5" size={25} />
                  )
              }
            </TouchableOpacity>
          </View>
          <View style={styles.lineStyle} />
          <View style={[BaseStyles.borderBottomHair, styles.titleStyle, BaseStyles.rowStart]}>
            <Text style={[BaseStyles.text15, BaseStyles.Color000]}>
              视频
            </Text>
          </View>
          <View style={{ paddingHorizontal: 15, paddingVertical: 15 }}>
            {
              videos.length > 0 ?
                <View style={styles.VideoBox}>
                  <TouchableOpacity
                    style={styles.chachaBox}
                    // onPress={this.onDelVideo}
                    onPress={() => {
                      this.onDelVideo(videos[0].id);
                    }}
                  >
                    <Icon name="chacha" color="#999" size={12} />
                  </TouchableOpacity>
                  <Video
                    style={{ height: 200, width: screen.width - 30 }}
                    url={videos[0].url}
                    autoPlay={false}
                    loop
                    inlineOnly
                    logo="https://i.qfangimg.com/resource/xinfang/xf-wxapp/img/about.png"
                  />
                </View> :
                <TouchableOpacity style={[styles.VideoBox, BaseStyles.rowCenter]} onPress={this.onPickVideo}>
                  {
                    isLoadingVideo ?
                      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={require('../../assets/img/loading.png')} style={{ width: 35, height: 35, marginBottom: 10 }} />
                        <Text>上传中</Text>
                      </View> :
                      <Icon name="tianjia" color="#E5E5E5" size={25} />
                  }
                </TouchableOpacity>
            }
          </View>
          <View style={styles.lineStyle} />
          <View style={{ paddingBottom: 50 }} />
        </ScrollView >
        <Toast
          ref={(c) => { this.toast = c; }}
          position="center"
          opacity={0.7}
          positionValue={screen.height / 2}
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  lineStyle: {
    height: 10,
    backgroundColor: '#F9F9F9',
    flex: 1,
  },
  infoInnerBox: {
    height: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  topFlagBoxFalse: {
    backgroundColor: '#ccc',
    paddingHorizontal: 3,
    paddingVertical: 3,
    borderRadius: 3,
  },
  topFlagBoxTrue: {
    backgroundColor: '#FF9911',
    paddingHorizontal: 3,
    paddingVertical: 3,
    borderRadius: 3,
  },
  seleTypeBoxFalse: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 7,
    width: 14,
    height: 14,
    marginRight: 5,
  },
  seleTypeBoxTrue: {
    borderWidth: 1,
    borderColor: '#ff9911',
    borderRadius: 7,
    width: 14,
    height: 14,
    marginRight: 5,
  },
  seleTypeBoxCenter: {
    borderWidth: 2,
    borderColor: '#fff',
    width: 12,
    height: 12,
    backgroundColor: '#ff9911',
    borderRadius: 6,
  },
  titleStyle: {
    paddingLeft: 15,
    height: 57,
  },
  imagesBoxStyle: {
    flexWrap: 'wrap',
    width: screen.width - 15,
  },
  imagesFourStyle: {
    width: (screen.width - 45) / 2,
    height: (screen.width - 40) / 2,
  },
  imagesStyle: {
    width: 100,
    height: 100,
  },
  imgBox: {
    borderColor: 'rgba(238,238,238,1)',
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 15,
    marginRight: 14,
    position: 'relative',
  },
  VideoBox: {
    borderColor: '#eee',
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: '#F9F9F9',
    height: 194,
    width: screen.width - 30,
  },
  chachaBox: {
    width: 18,
    height: 18,
    paddingHorizontal: 3,
    paddingVertical: 3,
    backgroundColor: '#F5F5F5',
    position: 'absolute',
    right: -2,
    top: -2,
    zIndex: 1000,
    borderRadius: 9,
  },
});
export default AddDynamic;
