'use strict';

import React, { Component } from 'react';
import PropTypes            from 'prop-types';
import { View }             from 'react-native';
import Picker               from './picker';
import moment               from 'moment';
import _                    from 'lodash';

const styles = {
    picker: {
        flex: 1
    }
};

const dayNumOfMonth = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];    // 各个月份的天数
export default class DatePicker extends Component {
    constructor(props) {
        super(props);
        this.state = this._stateFromProps(this.props);
    }

    componentWillReceiveProps(props) {
        this.setState(this._stateFromProps(props));
    }

    _stateFromProps(props) {
        const newState   = { date: props.date };
        let currentTime  = moment(newState.date);
        let min          = moment(props.minimumDate);
        let max          = moment(props.maximumDate);
        let adjustToTime = currentTime;

        let unit = undefined;
        if (props.mode === 'date') {
            unit = 'day';
        }

        if (currentTime.isBefore(min, unit)) {
            adjustToTime = min;
        }
        if (currentTime.isAfter(max, unit)) {
            adjustToTime = max;
        }
        if (!currentTime.isSame(adjustToTime)) {
            newState.date = new Date(+adjustToTime.format('x'));
        }
        this.newValue = {
            year  : newState.date.getFullYear(),
            month : newState.date.getMonth(),
            day   : newState.date.getDate(),
            hour  : newState.date.getHours(),
            minute: newState.date.getMinutes()
        };

        let dayNum        = this._getCurrentDayNumOfMonth();
        newState.dayRange = this._genDateRange(dayNum, props);

        // 生成年份范围
        let minYear = props.minimumDate.getFullYear();
        let maxYear = props.maximumDate.getFullYear();
        if ((maxYear - minYear) >= 1) {
            newState.yearRange = _.map(_.range(minYear, maxYear + 1), (n) => {
                return { value: n, label: `${n}${props.labelUnit.year}` };
            });
        } else {
            newState.yearRange = [ { value: minYear, label: `${minYear}${props.labelUnit.year}` } ];
        }

        // 生成月份范围
        newState.monthRange = _.times(12, (n) => {
            return { value: n + 1, label: `${n + 1}${props.labelUnit.month}` };
        });

        this.updateSelectedValues({ ...this.newValue, month: this.newValue.month + 1 });

        return newState;
    }

    static propTypes = {
        labelUnit   : PropTypes.shape({
            year : PropTypes.string,
            month: PropTypes.string,
            day  : PropTypes.string
        }),
        date        : PropTypes.instanceOf(Date).isRequired,
        maximumDate : PropTypes.instanceOf(Date),
        minimumDate : PropTypes.instanceOf(Date),
        pickerStyle : PropTypes.any,
        mode        : PropTypes.oneOf([ 'date', 'time', 'datetime' ]),
        onDateChange: PropTypes.func
    };

    static defaultProps = {
        labelUnit  : { year: '年', month: '月', day: '日' },
        mode       : 'date',
        maximumDate: moment().add(10, 'years').toDate(),
        minimumDate: moment().add(-10, 'years').toDate(),
        date       : new Date()
    };

    render() {
        return (
            <View style={{ flexDirection: 'row' }}>
                {this.datePicker}
                {this.timePicker}
            </View>
        );
    }

    updateSelectedValues({ year, month, day, hour, minute }) {
        this.refs.year && this.refs.year.setState({ selectedValue: 0 }, () => this.refs.year.setState({ selectedValue: year }));
        this.refs.month && this.refs.month.setState({ selectedValue: 0 },
            () => this.refs.month.setState({ selectedValue: month + 1 },
                () => this.refs.month.setState({ selectedValue: month })));
        this.refs.date && this.refs.date.setState({ selectedValue: 0 }, () => this.refs.date.setState({ selectedValue: day }));
        this.refs.hour && this.refs.hour.setState({ selectedValue: 0 }, () => this.refs.hour.setState({ selectedValue: hour }));
        this.refs.minute && this.refs.minute.setState({ selectedValue: 0 }, () => this.refs.minute.setState({ selectedValue: minute }));
    }

    get datePicker() {
        if (!_.includes([ 'date', 'datetime' ], this.props.mode)) {
            return [];
        }

        return [
            <View key="year" style={styles.picker}>
                <Picker
                    ref="year"
                    style={this.props.pickerStyle || {}}
                    selectedValue={this.state.date.getFullYear()}
                    pickerData={this.state.yearRange}
                    onValueChange={(value) => {
                        let oldYear        = this.newValue.year;
                        this.newValue.year = value;
                        this._checkDate(oldYear, this.newValue.month, this.newValue.day);
                        this.props.onDateChange && this.props.onDateChange(this.getValue());
                    }}
                />
            </View>,
            <View key="month" style={styles.picker}>
                <Picker
                    ref="month"
                    style={this.props.pickerStyle || {}}
                    selectedValue={this.state.date.getMonth() + 1}
                    pickerData={this.state.monthRange}
                    onValueChange={(value) => {
                        let oldMonth        = this.newValue.month;
                        this.newValue.month = value - 1;
                        this._checkDate(this.newValue.year, oldMonth, this.newValue.day);
                        this.props.onDateChange && this.props.onDateChange(this.getValue());
                    }}
                />
            </View>,
            <View key="date" style={styles.picker}>
                <Picker
                    ref="date"
                    style={this.props.pickerStyle || {}}
                    selectedValue={this.state.date.getDate()}
                    pickerData={this.state.dayRange}
                    onValueChange={(value) => {
                        let oldDay        = this.newValue.day;
                        this.newValue.day = value;
                        this._checkDate(this.newValue.year, this.newValue.month, oldDay);
                        this.props.onDateChange && this.props.onDateChange(this.getValue());
                    }}
                />
            </View>
        ];
    }

    get timePicker() {
        if (!_.includes([ 'time', 'datetime' ], this.props.mode)) {
            return [];
        }
        return [
            <View key="hour" style={styles.picker}>
                <Picker
                    ref="hour"
                    style={this.props.pickerStyle || {}}
                    selectedValue={this.state.date.getHours()}
                    pickerData={_.range(0, 24)}
                    onValueChange={(value) => {
                        this.newValue.hour = value;
                        this.props.onDateChange && this.props.onDateChange(this.getValue());
                    }}
                />
            </View>,
            <View key="minute" style={styles.picker}>
                <Picker
                    ref="minute"
                    style={this.props.pickerStyle || {}}
                    selectedValue={this.state.date.getMinutes()}
                    pickerData={_.range(0, 60)}
                    onValueChange={(value) => {
                        this.newValue.minute = value;
                        this.props.onDateChange && this.props.onDateChange(this.getValue());
                    }}
                />
            </View>
        ];
    }

    _checkDate(oldYear, oldMonth, oldDay) {                             // 检查新的值是否合法
        let currentMonth = this.newValue.month;
        let currentYear  = this.newValue.year;
        let currentDay   = this.newValue.day;

        let dayRange = this.state.dayRange;
        let dayNum   = dayRange.length;
        if (oldMonth !== currentMonth || oldYear !== currentYear) {            // 月份有发动
            dayNum = this._getCurrentDayNumOfMonth();
        }
        if (dayNum !== dayRange.length) {                                   // 天数有变
            dayRange = this._genDateRange(dayNum);
            if (currentDay > dayNum) {
                currentDay = this.newValue.day = dayNum;
                this.refs.date.setState({ selectedValue: dayNum });
            }
            this.setState({ dayRange });
        }

        let unit = undefined;
        if (this.props.mode === 'date') {
            unit = 'day';
        }

        let { year, month, day, hour, minute } = this.newValue;
        let currentTime                        = moment([ year, month, day, hour, minute ]);
        let min                                = moment(this.props.minimumDate);
        let max                                = moment(this.props.maximumDate);
        let adjustToTime                       = currentTime;
        if (currentTime.isBefore(min, unit)) {    // 超出最小值
            adjustToTime = min;
        }
        if (currentTime.isAfter(max, unit)) {     // 超出最大值
            adjustToTime = max;
        }
        if (!currentTime.isSame(adjustToTime)) {  // 超出选择范围
            year   = adjustToTime.get('year');
            month  = adjustToTime.get('month') + 1;
            day    = adjustToTime.get('date');
            hour   = adjustToTime.get('hour');
            minute = adjustToTime.get('minute');

            this.updateSelectedValues({ year, month, day, hour, minute });
        }
    }

    _getCurrentDayNumOfMonth() {
        let currentMonth = this.newValue.month;
        let currentYear  = this.newValue.year;
        let dayNum;

        if (currentMonth === 1) {                // 当前为2月份
            if (moment([ currentYear ]).isLeapYear()) {
                dayNum = 29;    // 闰年2月29天
            } else {
                dayNum = 28;    // 否则28天
            }
        } else {
            dayNum = dayNumOfMonth[ currentMonth ];
        }

        return dayNum;
    }

    _genDateRange(dayNum, props) {     // 生成日期范围
        return _.times(dayNum, (n) => {
            return { value: n + 1, label: `${n + 1}${props ? props.labelUnit.day : this.props.labelUnit.day}` };
        });
    }

    getValue() {
        const { year, month, day, hour, minute } = this.newValue;
        let date                                 = new Date(year, month, day, hour, minute);
        if (date < +moment(this.props.minimumDate).format('x')) {
            date = this.props.minimumDate;
        }
        if (date > +moment(this.props.maximumDate).format('x')) {
            date = this.props.maximumDate;
        }
        return date;
    }
}
