// 通讯录列表
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  DeviceEventEmitter,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Contacts from 'react-native-contacts';
import GoBack from './GoBack';

export default class ContactsList extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: '通讯录',
    headerLeft: <GoBack navigation={navigation} />,
  });
  constructor(props) {
    super(props);
    this.state = {
      contacts: [],
    };
  }

  componentDidMount() {
    const param = {
      pageName: 'ContactsList',
    };

    Contacts.getAll((err, contacts) => {
      if (err === 'denied') {
        // error
      } else {
        this.setState({
          contacts,
        });
      }
    });
  }

  componentWillUnmount() {
    const param = {
      pageName: 'ContactsList',
    };
  }

  render() {
    return (
      <View style={{ backgroundColor: '#fff' }}>
        <View
          style={{
            backgroundColor: '#efefef',
            height: 50,
            justifyContent: 'center',
            paddingLeft: 10,
          }}
        >
          <Text>联系人：{this.state.contacts.length}</Text>
        </View>
        <ScrollView style={{ marginBottom: 40 }}>
          {this.state.contacts.map((el) => (
            <View style={styles.item} key={el.recordID}>
              <Image
                style={styles.photo}
                source={
                  el.thumbnailPath
                    ? { uri: el.thumbnailPath }
                    : require('../assets/img/head.png')
                }
              />
              <View>
                <Text style={{ fontSize: 16 }}>
                  {el.familyName ? el.familyName : el.givenName}
                </Text>
                {el.phoneNumbers.map((ele) => (
                  <TouchableOpacity
                    style={styles.btn}
                    key={ele.number}
                    onPress={() => {
                      DeviceEventEmitter.emit('contactChoose', {
                        customerName: el.familyName
                          ? el.familyName
                          : el.givenName,
                        customerPhone: ele.number.replace(/[-()+]/g, ''),
                      });
                      this.props.navigation.goBack();
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>{ele.number}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }
}

let styles = StyleSheet.create({
  item: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomColor: '#dedede',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
  },
  photo: {
    width: 50,
    height: 50,
    marginRight: 30,
    borderRadius: 25,
  },
  btn: {
    marginTop: 10,
    marginBottom: 10,
  },
});
