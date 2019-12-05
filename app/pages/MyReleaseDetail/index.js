import React, { PureComponent } from 'react';
import {
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  // InteractionManager,
  DeviceEventEmitter,
  ScrollView,
  ActivityIndicator,
  findNodeHandle,
  UIManager,
} from 'react-native';
import axios from 'axios';
import Toast from 'react-native-easy-toast';
import DialogBox from '../../components/react-native-dialogbox';
// 友盟统计
// import { UMNative } from '../../common/NativeHelper';
import GoBack from '../../components/GoBack';
import Icon from '../../components/Icon/';
import BaseStyles from '../../style/BaseStyles';
import { screen } from '../../utils';

// 成交详情页面

class MyReleaseDetail extends PureComponent {
  // static propTypes = {
  //   navigation: PropTypes.object,
  // };

  static defaultProps = {
    navigation: {},
  };

  static navigationOptions = ({ navigation }) => {
    const { params = {} } = navigation.state;

    return {
      title: params.expandName,
      headerLeft: <GoBack navigation={navigation} />,
      headerRight: (
        <TouchableOpacity
          style={{ paddingHorizontal: 10, height: '100%', justifyContent: 'center' }}
          onPress={() => {
            params.alertConfirm(params, 'release');
          }}
        >
          <Text style={BaseStyles.yellow}>删除</Text>
        </TouchableOpacity>
      ),
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      detailData: {},
      commentsData: [],
      loading: true,
      foldFlag: false, // 标题字数超过400 折叠
      hadFold: false, // 是否有 展开、收起 按钮
    };
    this.titleHeight = 0;
  }

  componentDidMount() {
    //  在static navigationOptions中使用this方法
    this.props.navigation.setParams({
      alertConfirm: this.alertConfirm.bind(this),
    });
    // 统计页面时长
    // UMNative.onPageBegin('SUBSCRIBE_DETAIL');
    this.requestData();
    // this.getCommentData();
    // this.subRefresh = DeviceEventEmitter.addListener(
    //   'DealDetailsRefresh',
    //   this.requestData.bind(this),
    // );
    setTimeout(() => {
      this.layout(this.titleText).then((res) => {
        this.onLayout(res);
      });
    }, 100);
  }
  componentWillUnmount() {
    // 统计页面时长
    // UMNative.onPageEnd('SUBSCRIBE_DETAIL');
    // 移除
    // this.subRefresh.remove();
  }

  onLayout(data) {
    const { height } = data;

    if (this.titleHeight === 0) {
      this.titleText.setNativeProps({
        numberOfLines: Math.ceil(height / 20),
        style: { height },
      });

      this.titleHeight = height;


      if (height > 80) {
        this.titleText.setNativeProps({
          numberOfLines: 4,
          style: { height: 82 },
        });

        this.setState({
          foldFlag: true, // 标题 超过4行 折叠
          hadFold: true, // 是否有 展开、收起 按钮
        });
      }
    }
  }


  getCommentData() {
    const navigation = this.props.navigation;
    const { params = {} } = navigation.state;
    const reportId = params.reportId;
    axios.get('expand/report/comments', {
      params: {
        reportId,
        page: 1,
        pageSize: 1000,
      },
    })
      .then((res) => {
        this.setState({
          loading: false,
        });
        if (res.data.status !== 'C0000') {
          this.toast.show('请求失败!');
          return;
        }

        const commentsData = res.data.result.items;

        this.setState({
          commentsData,
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
        });
        this.toast.show('服务器异常');
      });
  }

  requestData() {
    const navigation = this.props.navigation;
    const { params = {} } = navigation.state;
    const reportId = params.reportId;
    axios.get('expand/report/reportDetail', { params: { reportId } })
      .then((res) => {
        this.setState({
          loading: false,
        });
        if (res.data.status !== 'C0000') {
          this.toast.show('请求失败!');
          return;
        }
        const detailData = res.data.result;

        let commentsData = detailData.comments;

        commentsData = commentsData && commentsData.filter((item) => item.type === 'COMMENT');

        this.setState({
          detailData,
          commentsData,
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
        });
        this.toast.show('服务器异常');
      });
  }

  layout(ref) {
    const handle = findNodeHandle(ref);

    return new Promise((resolve) => {
      UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
        resolve({
          x,
          y,
          width,
          height,
          pageX,
          pageY,
        });
      });
    });
  }
  // 删除确认弹出框
  alertConfirm(item, type) {
    this.dialogbox.confirm({
      title: null,
      content: (
        <View style={styles.modelBox}>
          <View style={styles.modelTilteBox}>
            <Icon name="jingshi" size={20} color="#ffc601" style={{ width: 34 }} />
            <Text style={styles.modelTilte}>{type === 'comment' ? '确认删除该条评论吗？' : '确认删除该条发布吗？'}</Text>
          </View>
        </View>
      ),
      cancel: {
        text: '取消',
        style: {
          color: '#3a3a3a',
          fontSize: 18,
        },
        callback: () => {
          this.dialogbox.close();
        },
      },
      ok: {
        text: '确认',
        style: {
          fontSize: 18,
          color: '#ffa200',
        },
        callback: () => {
          // 接口成功失败后关闭窗口
          this.dialogbox.close();
          if (type === 'comment') {
            this.deleteComment(item.id);
          }
          if (type === 'release') {
            this.deleteRelease(item.reportId);
          }
        },
      },
    });
  }

  deleteRelease(reportId) {
    axios.get('expand/report/delete', { params: { reportId } })
      .then((res) => {
        if (res.data.status !== 'C0000') {
          this.toast.show('删除失败!');
          return;
        }

        this.props.navigation.goBack();

        DeviceEventEmitter.emit('RefreshReleaseList');
      })
      .catch((err) => {
        this.toast.show('服务器异常');
      });
  }

  deleteComment(id) {
    axios.get('expand/report/deleteComment', { params: { commentId: id } })
      .then((res) => {
        if (res.data.status !== 'C0000') {
          this.toast.show('删除失败!');
          return;
        }

        DeviceEventEmitter.emit('RefreshReleaseList');

        this.setState({
          commentsData: this.state.commentsData.filter((val) => val.id !== id),
        });
      })
      .catch((err) => {
        this.toast.show('服务器异常');
      });
  }


  render() {
    const { detailData } = this.state;
    const { commentsData } = this.state;
    let photosArr = [];
    photosArr = detailData.photos ? detailData.photos.split(',') : [];
    if (photosArr.length === 1 && photosArr[0] === '') {
      photosArr = [];
    }

    const len = photosArr.length;

    let images = [];

    if (len > 0) {
      if (len === 1) {
        images.push(photosArr[0].replace('{size}', '1500x1000'));
      } else {
        images = photosArr.map((val) => val.replace('{size}', '1500x1000'));
      }
    }


    return (
      <View>
        <ScrollView style={{ height: screen.height - 70 }}>
          <View style={[BaseStyles.container, styles.releaseContainer]}>
            <View>
              <Text
                ref={(c) => { this.titleText = c; }}
                style={[BaseStyles.text14, BaseStyles.black, { lineHeight: 20, minHeight: 20 }]}
                ellipsizeMode="tail"
              >
                {detailData.title}
              </Text>
            </View>


            {
              this.state.hadFold &&
              <TouchableOpacity
                style={{ paddingTop: 5, flexDirection: 'row' }}
                onPress={() => {
                  this.setState({
                    foldFlag: !this.state.foldFlag,
                  });
                  if (this.state.foldFlag) {
                    this.titleText.setNativeProps({
                      numberOfLines: Math.ceil(this.titleHeight / 20),
                      style: { height: this.titleHeight },
                    });
                  } else {
                    this.titleText.setNativeProps({
                      numberOfLines: 4,
                      style: { height: 82 },
                    });
                  }
                }}
              >
                {
                  this.state.foldFlag ?
                    <Text style={BaseStyles.yellow}>展开</Text>
                    :
                    <Text style={BaseStyles.yellow}>收起</Text>

                }
                {
                  this.state.foldFlag ?
                    <Icon name="arrow-down" size={16} color="#ffc601" />
                    :
                    <Icon name="arrow-up" size={16} color="#ffc601" />
                }

              </TouchableOpacity>
            }


            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {
                images.length ?
                  images.map((val) => (
                    <View
                      key={val}
                      style={{ paddingTop: 5, paddingLeft: 5 }}
                    >
                      <Image
                        style={{ height: images.length === 1 ? 200 : 100, width: images.length === 1 ? 200 : 100 }}
                        resizeMode="cover"
                        source={{ uri: val }}
                      />
                    </View>
                  ))
                  :
                  null
              }
            </View>


          </View>

          {/* 管理评论start */}
          <View style={[BaseStyles.container, { backgroundColor: '#fff' }]}>

            <View style={styles.commonHeader}>
              <View style={styles.leftYellow}>
                <Text style={styles.commonTitle}>管理评论</Text>
              </View>
            </View>

            <View style={styles.commentContainer}>
              {
                commentsData && commentsData.length > 0 ?
                  commentsData.map((val) => (

                    <View style={styles.commentMain} key={val.id}>
                      <View style={styles.commentLeft}>
                        <Icon name="daikan" size={12} color="#ffc601" style={{ marginRight: 2 }} />
                        <Text style={[BaseStyles.text12, BaseStyles.gray]}>{val.operatorName || '未知姓名'}：</Text>
                        <Text style={[BaseStyles.text12, BaseStyles.black, { maxWidth: '80%' }]}>{val.comment}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          this.alertConfirm(val, 'comment');
                        }}
                      >
                        <Icon name="baocuo2" size={14} color="#ffc601" />
                      </TouchableOpacity>
                    </View>
                  ))
                  :
                  <View style={[BaseStyles.centerContainer, { paddingBottom: 20 }]}>
                    <Text style={[BaseStyles.text16, BaseStyles.gray]}>暂无评论</Text>
                  </View>
              }


            </View>
          </View>
          {/* 管理评论end */}

        </ScrollView>
        <Toast
          ref={(toast) => { this.toast = toast; }}
          position="center"
          opacity={0.7}
        />

        <DialogBox
          ref={(dialogbox) => {
            this.dialogbox = dialogbox;
          }}
        />

        {this.state.loading && (
          <View style={BaseStyles.overlayLoad}>
            <ActivityIndicator
              size="large"
              color="white"
              style={{ marginTop: -150 }}
            />
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  releaseContainer: {
    backgroundColor: '#fff',
    marginVertical: 10,
    padding: 10,
  },
  commonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 66,
  },
  leftYellow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderLeftWidth: 3,
    borderLeftColor: '#ffc601',
  },
  commonTitle: {
    paddingLeft: 12,
    fontSize: 18,
    color: '#3a3a3a',
  },
  commentMain: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 54,
    paddingHorizontal: 15,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#e7e8ea',
  },
  commentLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  modelBox: {
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  modelTilteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  modelTilte: {
    fontSize: 16,
    color: '#3a3a3a',
  },
});

export default MyReleaseDetail;
