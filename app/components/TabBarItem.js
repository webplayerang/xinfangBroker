
import React, { PureComponent } from 'react';
import Icon from './Icon/';

class TabBarItem extends PureComponent {
  render() {
    const selectedImage = this.props.selectedImage ? this.props.selectedImage : this.props.normalImage;
    return (
      <Icon
        name={this.props.focused
          ? selectedImage
          : this.props.normalImage}
        size={this.props.size}
        color={this.props.focused
          ? this.props.tintColor
          : '#7e7e7e'}
      />
    );
  }
}

export default TabBarItem;
