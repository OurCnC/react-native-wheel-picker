import * as React               from 'react';

import { StyleProp, ViewStyle } from 'react-native';

interface PickerProps {
    style?: StyleProp<ViewStyle>,
    onValueChange: Function,
    pickerData?: any[],
    selectedValue: any,
    textColor?: string,
    textSize?: number,
    itemStyle?: StyleProp<ViewStyle>,
    itemSpace?: number,
    selectedIndex?: number
}

interface DatePickerProps {
    labelUnit?: {
        year: string,
        month: string,
        day: string
    },
    date?: Date,
    maximumDate?: Date,
    minimumDate?: Date,
    mode?: 'date' | 'time' | 'datetime',
    onDateChange: Function
}

declare class Picker extends React.Component<PickerProps, any> {}

declare class DatePicker extends React.Component<DatePickerProps, any> {}

export { Picker, DatePicker };
