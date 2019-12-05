/* eslint-disable react/prop-types */
// 上数页面
import React, { PureComponent } from 'react';
import {
  Text,
  View,
  Image,
  Modal,
  Alert,
  NetInfo,
  Clipboard,
  StyleSheet,
  ScrollView,
  CameraRoll,
  Platform,
  Linking,
  DeviceEventEmitter,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import { withNavigation } from 'react-navigation';
import RNFS from 'react-native-fs';
import Toast from 'react-native-easy-toast';
import Video from 'react-native-af-video-player';
import ImageViewer from 'react-native-image-zoom-viewer';
import { screen, system } from '../../../utils';
import Icon from '../../../components/Icon';
import BaseStyles from '../../../style/BaseStyles';
import ShareAlertDialog from '../../ReportDetail/ShareAlertDialog';


// const { storage } = global;
const MAX_HEIGHT = 80; // 发布内容多过4行，显示 收齐 展开
class DynamicItem extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isShowMore: false,
      MoreState: false,
      lineNum: 4,
      ShareCoverState: false,
      videoCoverState: false,
      picturesCoverState: false,
      shareCount: 0,
      showSharePop: false,
    };
    this.imgIndex = 0;
    this.onMoreEvent = this.onMoreEvent.bind(this);
    this.onShareCover = this.onShareCover.bind(this);
    this.toShareEvent = this.toShareEvent.bind(this);
    this.toEditDynamic = this.toEditDynamic.bind(this);
    this.onControlVideo = this.onControlVideo.bind(this);
    this.onCloseVideoCover = this.onCloseVideoCover.bind(this);
    this.ondelDynamic = this.ondelDynamic.bind(this);
    this.downloadFile = this.downloadFile.bind(this);
    this.onShareCoverClose = this.onShareCoverClose.bind(this);
    this.netInfo = this.netInfo.bind(this);
    // this.deleteCacheImage = this.deleteCacheImage.bind(this);
  }


  // 控制显示全部内容
  onMoreEvent () {
    const { MoreState } = this.state;
    if (!MoreState) {
      this.setState({
        lineNum: 100,
        MoreState: true,
      });
    } else {
      this.setState({
        lineNum: 4,
        MoreState: false,
      });
    }
  }
  // 关闭相册弹窗
  onPicturesCover (index) {
    const { picturesCoverState } = this.state;
    this.imgIndex = index;
    this.setState({
      picturesCoverState: !picturesCoverState,
    });
  }
  // 关闭分享弹窗
  onShareCoverClose () {
    this.setState({
      ShareCoverState: false,
    });
  }
  // 开启分享弹窗
  onShareCover () {
    const { props } = this;
    Clipboard.setString(props.item.content);

    if (props.item.pictures.length) {
      props.item.pictures.map((item) => (
        this.downloadFile(item.url, 'PICTURE')
      ));
    }
    if (props.item.video) {
      this.downloadFile(props.item.video.url, 'VIDEO');
    }
    this.setState({
      ShareCoverState: true,
    });
  }

  async onControlVideo (connectionHandler) {
    // 声明wifiTip 为0，如果load之后取到storage则证明用户已经确定过wifi提示，
    // wifiTip 不为1的时候证明没有取到storage，则网络不为wifi时跳出alert提示用户
    // alert会打断setState，需要声明isPlay，如果进入到alert中则将isPlay设置为flase，不进行setState
    let wifiTip = 0;
    let isPlay = true;
    await storage.load({ key: 'wifiTip' })
      .then(() => {
        wifiTip = 1;
      })
      .catch((err) => {
        console.log(err);
      });
    const netType = connectionHandler.type;
    if ((netType !== 'wifi' && wifiTip !== 1)) {
      isPlay = false;
      Alert.alert('网络检测', '非WiFi环境下播放，请注意流量消耗', [
        {
          text: '不再提示',
          onPress: () => {
            storage.save({
              key: 'wifiTip',
              data: 1,
              expires: 1000 * 3600 * 24,
            });
          },
        },
        {
          text: '好的',
          onPress: () => {
            this.setState({
              videoCoverState: true,
            });
          },
        },
      ]);
    }
    if (isPlay) {
      this.setState({
        videoCoverState: true,
      });
    }
  }


  // 关闭视频弹窗
  onCloseVideoCover () {
    this.setState({
      videoCoverState: false,
    });
  }
  // 点击删除
  ondelDynamic () {
    Alert.alert('确认删除', '', [
      {
        text: '确认',
        onPress: () => {
          const { props } = this;
          axios.post(`gardenDynimic/remove?id=${props.item.id}`, {
            id: props.item.id,
          }).then((res) => {
            if (res.data.status === 'C0000') {
              DeviceEventEmitter.emit('AllDynamicList');
              DeviceEventEmitter.emit('MyDynamicList');
              this.toast.show('动态删除成功');
            }
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


  setWordHeight (event) {
    const { height } = event.nativeEvent.layout;
    if (parseFloat(height) > MAX_HEIGHT) {
      this.setState({
        isShowMore: true,
      });
    } else {
      this.setState({
        isShowMore: false,
      });
    }
  }

  // 判断网络状态
  netInfo () {
    if (Platform.OS === 'ios') {
      const connectionHandler = (connectionInfo) => {
        NetInfo.removeEventListener('connectionChange', connectionHandler);
      };
      NetInfo.addEventListener('connectionChange', this.onControlVideo);
    }
    NetInfo.getConnectionInfo().then((connectionInfo) => this.onControlVideo(connectionInfo));
  }

  isShowMore () {
    const { isShowMore, MoreState } = this.state;
    if (isShowMore) {
      return (
        !MoreState ?
          <TouchableOpacity style={BaseStyles.rowEnd} onPress={this.onMoreEvent}>
            <Text style={[BaseStyles.text13, BaseStyles.colorEB9D49, { marginRight: 5 }]}>
              展开全部
            </Text>
            <Icon name="arrow-down" size={12} color="#EB9D49" />
          </TouchableOpacity>
          :
          <TouchableOpacity style={BaseStyles.rowEnd} onPress={this.onMoreEvent}>
            <Text style={[BaseStyles.text13, BaseStyles.colorEB9D49, { marginRight: 5 }]}>
              收起多余
            </Text>
            <Icon name="arrow-up" size={12} color="#EB9D49" />
          </TouchableOpacity>
      );
    }
    return null;
  }

  downloadFile (uri, type) {
    if (!uri) return null;
    return new Promise((resolve, reject) => {
      const timestamp = (new Date()).getTime();// 获取当前时间错
      const random = String(((Math.random() * 1000000) || 0));// 六位随机数
      const dirs = Platform.OS === 'ios' ? RNFS.LibraryDirectoryPath : RNFS.ExternalDirectoryPath; // 外部文件，共享目录的绝对路径（仅限android）
      let downloadDest;
      if (type === 'PICTURE') {
        downloadDest = `${dirs}/${timestamp + random}.jpg`;
      } else if (type === 'VIDEO') {
        downloadDest = `${dirs}/${timestamp + random}.mp4`;
      }
      // const downloadDest = `${dirs}/${timestamp+random}.zip`;
      // const downloadDest = `${dirs}/${timestamp+random}.mp3`;
      const formUrl = uri;
      const options = {
        fromUrl: formUrl,
        toFile: downloadDest,
        background: true,
        begin: () => {
          // console.log('contentLength:', res.contentLength / 1024 / 1024, 'M');
        },
        progress: () => {
          // pro等于1的时候表示下载完成
          // const pro = res.bytesWritten / res.contentLength;
          // callback(pro);// 下载进度
        },
      };
      try {
        const ret = RNFS.downloadFile(options);
        ret.promise.then((res) => {
          const promise = CameraRoll.saveToCameraRoll(downloadDest);
          promise.then(() => {
          }).catch(() => {
          });
          resolve(res);
        }).catch((err) => {
          reject(new Error(err));
        });
      } catch (e) {
        reject(new Error(e));
      }
    });
  }
  toEditDynamic () {
    const { props } = this;
    props.navigation.navigate('EditDynamic', {
      info: props.item,
    });
  }


  operaBtn (item) {
    if (item.operable) {
      if (item.status === 'DELETED') {
        return (
          <Text style={[BaseStyles.text14, BaseStyles.color949, { marginRight: 15 }]}>已删除</Text>
        );
      }
      return (
        <View style={BaseStyles.rowStart}>
          <TouchableOpacity onPress={this.ondelDynamic}>
            <Text style={[BaseStyles.text14, BaseStyles.orange]}>删除</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.toEditDynamic}>
            <Text style={[BaseStyles.text14, BaseStyles.color949, { marginHorizontal: 15 }]}>编辑</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  }
  // 点击分享
  toShareEvent () {
    const { item } = this.props;
    // garden/dynamic/incShareCount
    axios.post(`/gardenDynimic/incShareCount?id=${item.id}`);
    this.setState({
      ShareCoverState: false,
      showSharePop: true,
    });
  }

  openShare (typeStr) {
    const { item } = this.props;
    if (typeStr === 'wx') {
      const url = 'weixin://';
      Linking.canOpenURL(url).then((supported) => {
        if (!supported) {
          this.toast.show('当前版本不支持跳转微信');
          return;
        }
        Linking.openURL(url);
        this.setState({
          shareCount: item.shareCount + 1,
        });
      }).catch((err) => console.log(`未知错误${err}`));
    }
    if (typeStr === 'dx') {
      let url = '';
      if (system.isIOS) {
        url = `sms:&body=${item.content}`;
      } else {
        url = `sms:?body=${item.content}`;
      }

      Linking.canOpenURL(url).then((supported) => {
        if (!supported) {
          this.toast.show('当前版本不支持拨打号码或发送短信');
          return;
        }
        Linking.openURL(url);
        this.setState({
          shareCount: item.shareCount + 1,
        });
      }).catch((err) => console.log(`未知错误${err}`));
    }
  }

  closeModal (key) {
    this.setState({
      [key]: false,
    });
  }

  bigPictures (item) {
    const bigImgs = item.pictures.map((itImg) => {
      if (itImg.url.indexOf('?imageView2') > -1) {
        itImg.url = itImg.url;
      } else {
        itImg.url += `?imageView2/2/w/${screen.width * 4}/`;
      }
      return itImg;
    });
    return (
      <ImageViewer imageUrls={bigImgs} resizeMode="stretch" index={this.imgIndex} />
    );
  }

  smallPictures (item) {
    const len = item.pictures.length;
    if (len > 0) {
      return (
        item.pictures.map((itemImg, index) => {
          const lenImg = itemImg.url.indexOf('?');
          const imgUrl = lenImg > -1 ? itemImg.url.substring(0, lenImg) : itemImg.url;
          if (len === 1) {
            return (
              <TouchableOpacity
                key={itemImg.url}
                onPress={() => this.onPicturesCover(index)}
              >
                <Image
                  source={{
                    uri: `${imgUrl}?imageView2/1/w/600/h/440`,
                  }}
                  style={{ width: screen.width - 30, height: 220 }}
                />
              </TouchableOpacity>
            );
          } else if (len === 2 || len === 4) {
            return (
              <TouchableOpacity
                key={index.toString()}
                onPress={() => this.onPicturesCover(index)}
              >
                <Image
                  source={{
                    uri: `${imgUrl}?imageView2/1/w/300/h/200`,
                  }}
                  style={[(index + 1) % 2 ? styles.marginR10 : styles.marginR0, styles.imagesFourStyle]}
                />
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity
              key={index.toString()}
              onPress={() => this.onPicturesCover(index)}
              style={[(index + 1) % 3 ? styles.marginR10 : styles.marginR0]}
            >
              <Image
                source={{ uri: `${imgUrl}?imageView2/1/w/200/h/200` }}
                style={[styles.imagesStyle]}
              />
            </TouchableOpacity>
          );
        })
      );
    }
    return null;
  }
  render () {
    const {
      lineNum,
      ShareCoverState,
      videoCoverState,
      picturesCoverState,
      shareCount,
    } = this.state;
    const { item } = this.props;
    return (
      <View style={styles.packageStyle} >
        {/* 相册弹窗 */}
        <Modal
          transparent
          visible={picturesCoverState}
          onRequestClose={() => this.closeModal(picturesCoverState)}
        >

          {
            item.pictures.length ? (
              this.bigPictures(item)
            ) : null
          }
          <TouchableOpacity
            style={{
              paddingHorizontal: 10,
              paddingVertical: 10,
              backgroundColor: 'rgba(0,0,0,0.5)',
              position: 'absolute',
              zIndex: 101,
              top: 50,
              left: 30,
              borderRadius: 5,
            }}
            onPress={() => this.onPicturesCover(0)}
          >
            <Icon name="jiaocha" size={15} color="#fff" />
          </TouchableOpacity >
        </Modal >
        {/* 分享弹窗开始 */}
        <Modal
          animationType="fade"
          transparent
          visible={ShareCoverState}
          onRequestClose={() => this.closeModal(ShareCoverState)}
        >
          <View style={styles.modelBox}>
            <View style={{ backgroundColor: '#fff', borderRadius: 5, width: screen.width - 30 }}>
              <View style={[BaseStyles.rowStart, styles.modelTitle]}>
                <Icon name="zhengque" size={20} color="#19AB19" />
                <Text style={[BaseStyles.text16, BaseStyles.color000, BaseStyles.textBold, { marginLeft: 5, marginTop: -2 }]}>图片已保存到相册，文字信息已生成。</Text>
              </View>
              <View style={{ paddingVertical: 10 }}>
                <ScrollView style={{ height: 200, paddingHorizontal: 10 }}>
                  <Text style={[BaseStyles.text15, BaseStyles.color333, BaseStyles.fzlineHeight26]}>
                    {item.content}
                  </Text>
                </ScrollView>
              </View>
              <View style={[BaseStyles.rowCenterSpace, BaseStyles.borderTopHair, styles.modelBottonPage]}>
                <TouchableOpacity style={styles.modelBottonBox} onPress={this.onShareCoverClose}>
                  <Text style={[BaseStyles.text14, BaseStyles.color949]}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modelBottonBox, { backgroundColor: '#F19E3C' }]} onPress={this.toShareEvent}>
                  <Text style={[BaseStyles.text14, BaseStyles.white]}>去分享</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal >
        {/* 分享弹窗结束 */}
        {/* 视频弹窗开始 */}
        {
          item.video !== null ? <Modal
            animationType="none"
            transparent={false}
            visible={videoCoverState}
            onRequestClose={() => this.closeModal(videoCoverState)}
          >
            <View style={{
              backgroundColor: '#000',
              borderRadius: 5,
              width: screen.width,
              height: screen.height,
              ...Platform.select({
                android: {
                  marginTop: -20,
                },
              }),
            }}
            >
              <Video
                url={item.video.url}
                autoPlay
                // loop
                fullScreenOnly
                inlineOnly
                logo="https://i.qfangimg.com/resource/xinfang/xf-wxapp/img/about.png"
                bufferConfig={{
                  minBufferMs: 5000,
                  maxBufferMs: 20000,
                }}
              />
              <TouchableOpacity
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  position: 'absolute',
                  zIndex: 101,
                  top: 50,
                  left: 30,
                  borderRadius: 5,
                }}
                onPress={this.onCloseVideoCover}
              >
                <Icon name="jiaocha" size={15} color="#fff" />
              </TouchableOpacity>
            </View>
          </Modal> : null
        }

        {/* 视频弹窗结束 */}
        <View style={[styles.PackageBorderStyle, BaseStyles.borderBottomHair]}>
          <Text style={[styles.titleStyle, BaseStyles.color000, BaseStyles.text18, BaseStyles.textBold]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={[BaseStyles.rowStart, { marginBottom: 12 }]}>
            <View style={styles.typeStyle}>
              <Text style={[BaseStyles.white, BaseStyles.text12]}>{item.typeStr}</Text>
            </View>
            {
              item.topFlag === 1 ?
                <View style={styles.topStyle}>
                  <Text style={[BaseStyles.white, BaseStyles.text12]}>置顶</Text>
                </View> : null
            }
            <Text style={[BaseStyles.text12, styles.tipsSaleType]}>{item.saleTypeStr}</Text>
            <Text style={[BaseStyles.text14, BaseStyles.color000, BaseStyles.textBold]}>【{item.extendName}】</Text>
          </View>
          <Text
            style={[BaseStyles.text15, BaseStyles.color949, BaseStyles.fzlineHeight26, { marginBottom: 6 }]}
            numberOfLines={lineNum}
            onLayout={(event) => this.setWordHeight(event)}
          >
            {item.content}
          </Text>
          {
            this.isShowMore()
          }
          {
            item.video !== null ?
              <View style={{ marginTop: 15, marginBottom: 20, position: 'relative' }}>
                <Image
                  style={{ width: screen.width - 30, height: 194, borderRadius: 5 }}
                  source={{ uri: item.video.videoCover }}
                />
                <TouchableOpacity
                  onPress={this.netInfo}
                  style={styles.bofangIconStyle}
                >
                  <Image
                    style={{ width: 46, height: 46 }}
                    source={require('../../../assets/img/play.png')}
                  />
                </TouchableOpacity>
              </View> :
              <View
                style={[styles.imagesBoxStyle, BaseStyles.rowStart]}
              >
                {
                  this.smallPictures(item)
                }
              </View>
          }
          <View style={BaseStyles.rowCenterSpace}>
            <View style={BaseStyles.rowStart}>
              {
                this.operaBtn(item)
              }

              <Icon name="shijian" size={14} color="#9497A1" />
              <Text style={[BaseStyles.text14, BaseStyles.color949, { marginLeft: 5 }]}>{item.updateTime}</Text>
            </View>
            <TouchableOpacity
              style={[BaseStyles.rowStart, styles.shareStyle]}
              onPress={this.onShareCover}
            >
              <Icon name="fenxiang" size={13} color="#FF9911" />
              <Text
                style={[BaseStyles.text16, BaseStyles.orange, { marginLeft: 5 }]}
              >{shareCount > 0 ? shareCount : item.shareCount}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Toast ref={(ref) => { this.toast = ref; }} position="top" opacity={0.7} />
        <ShareAlertDialog
          show={this.state.showSharePop}
          parent={this}
          closeModal={(show) => {
            this.setState({ showSharePop: show });
          }}
          {...this.props}
        />
      </View >
    );
  }
}
const styles = StyleSheet.create({
  imagesBoxStyle: {
    marginTop: 15,
    marginBottom: 10,
    flexWrap: 'wrap',
    width: screen.width - 30,
    flexDirection: 'row',
  },
  imagesFourStyle: {
    flexDirection: 'row',
    width: (screen.width - 40) / 2,
    height: (screen.width - 40) / 2,
    marginBottom: 10,
  },
  imagesStyle: {
    width: (screen.width - 60) / 3,
    height: 100,
    marginBottom: 10,
  },
  marginR10: {
    marginRight: 10,
  },
  marginR0: {
    marginRight: 0,
  },
  packageStyle: {
    width: screen.width - 30,
    marginHorizontal: 15,
  },
  PackageBorderStyle: {
    paddingVertical: 20,
  },
  titleStyle: {
    width: screen.width - 30,
    marginBottom: 12,
  },
  typeStyle: {
    backgroundColor: '#FF9911',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
  },
  topStyle: {
    backgroundColor: '#4AB8F1',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
    marginLeft: 5,
  },
  shareStyle: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    backgroundColor: '#F5F5F9',
  },
  bofangIconStyle: {
    position: 'absolute',
    top: 76,
    left: (screen.width / 2) - 40,
    zIndex: 10,
  },
  modelBox: {
    width: screen.width,
    height: screen.height,
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modelTitle: {
    paddingRight: 15,
    paddingLeft: 15,
    paddingVertical: 20,
    borderBottomColor: '#eee',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modelBottonPage: {
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  modelBottonBox: {
    width: 150,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEEEEE',
    borderRadius: 5,
  },
  fullScreen: {
    width: screen.width,
    height: screen.height,
  },
  tipsSaleType: {
    color: '#EB9D49',
    paddingTop: 2,
    paddingLeft: 2,
    borderColor: '#EB9D49',
    borderWidth: 1,
    borderRadius: 3,
    marginLeft: 5,
  },
});

export default withNavigation(DynamicItem);
