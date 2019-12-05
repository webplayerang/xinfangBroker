
import { StyleSheet } from 'react-native';
import { screen, system } from '../../utils';

let iosTop = 20;
if (system.isIphoneX) {
  iosTop = 50;
} else if (system.isIphoneXs) {
  iosTop = 50;
}
export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  autocompleteContainer: {
    position: 'absolute',
    top: system.isIOS ? iosTop : 30,
    width: '100%',
    flex: 1,
    height: '100%',
  },

  inputContainerStyle: {
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#fff',
  },

  searchView: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    backgroundColor: '#f4f4f4',
    borderRadius: 6,
    borderWidth: 0,
    margin: 10,
    marginTop: 7,
    marginBottom: 7,
  },
  searchIcon: {
    marginLeft: 10,
    marginRight: 10,
  },
  inputStyle: {
    width: '82%',
    height: 30,
    padding: 0,
  },
  button: {
    height: 30,
  },
  buttonText: {
    fontSize: 15,
    margin: 7,
    marginLeft: 0,
    color: '#3a3a3a',
  },
  listContainerStyle: {
  },
  listStyle: {
    height: system.isIOS ? ((screen.height - iosTop) - 48) : screen.height - 20,
    borderWidth: 0,
    margin: 0,
  },
  itemRow: {
    marginLeft: 15,
    borderBottomColor: '#e5e5e5',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemText: {
    fontSize: 15,
    margin: 10,
    marginLeft: 0,
    color: '#9a9a9a',
  },
});
