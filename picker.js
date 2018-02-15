'use strict';

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import WheelCurvedPicker from './WheelCurvedPicker'
const PickerItem = WheelCurvedPicker.Item
import _ from 'lodash'

const styles = {
  picker: {
    backgroundColor: '#d3d3d3',
    height: 220
  },
  picker__item: {
    color: '#333333',
    fontSize: 26
  }
}


export default class Picker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedValue: this.props.selectedValue
    };
  }

  static propTypes = {
    onValueChange: PropTypes.func,
    pickerData: PropTypes.array,
    selectedValue: PropTypes.any
  }

  static defaultProps = {
    pickerData: []
  }

  componentWillReceiveProps(props) {
    this.setState({ selectedValue: props.selectedValue });
  }

  render() {
    const { onValueChange, pickerData, itemStyle, style, ...props } = this.props
    return (
      <WheelCurvedPicker
        {...props}
        style={[styles.picker, style]}
        itemStyle={_.assign({}, styles.picker__item, itemStyle)}
        selectedValue={this.state.selectedValue}
        onValueChange={(value) => {
          this.setState({ selectedValue: value })
          onValueChange && onValueChange( value )
        }}
      >
        {pickerData.map((data, index) => (
            <PickerItem key={index} value={data.value || data} label={data.label || data.toString()} />
          )
        )}
      </WheelCurvedPicker>
    )
  }

  getValue() {
    return this.state.selectedValue
  }
}
