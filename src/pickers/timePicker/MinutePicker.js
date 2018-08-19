import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import _ from 'lodash';

import MinuteView from '../../views/MinuteView';
import { getUnhandledProps } from '../../lib';
import {
  buildTimeStringWithSuffix,
  isNextPageAvailable,
  isPrevPageAvailable,
  getCurrentDate,
} from './sharedFunctions';

const MINUTES_STEP = 5;

class MinutePicker extends React.Component {
  /*
    Note:
      use it like this <MinutePicker key={someInputValue} />
      to make react create new instance when input value changes
  */
  constructor(props) {
    super(props);
    this.state = {
      /* moment instance */
      date: props.initializeWith.clone(),
    };
  }

  buildMinutes() {
    const hour = this.state.date.hour() < 10? '0' + this.state.date.hour().toString() : this.state.date.hour().toString();
    return _.range(0, 60, MINUTES_STEP)
      .map(minute => `${minute < 10? '0' : ''}${minute}`)
      .map(minute => buildTimeStringWithSuffix(hour, minute, this.props.timeFormat));
  }

  getActiveMinute() {
    /* The only purpose of this method is to return a minute position
    that should be displayed as active.
    */
    if (this.props.value) {
      return Math.floor(this.props.value.minutes() / MINUTES_STEP);
    }
  }

  isNextPageAvailable() {
    return isNextPageAvailable(this.state.date, this.props.maxDate);
  }

  isPrevPageAvailable() {
    return isPrevPageAvailable(this.state.date, this.props.minDate);
  }

  getCurrentDate() {
    return getCurrentDate(this.state.date);
  }

  handleChange = (e, { value }) => {
    const data = {
      year: this.state.date.year(),
      month: this.state.date.month(),
      date: this.state.date.date(),
      hour: this.state.date.hour(),
      minute: this.buildMinutes().indexOf(value) * MINUTES_STEP,
    };
    _.invoke(this.props, 'onChange', e, { ...this.props, value: data });
  }

  switchToNextPage = () => {
    this.setState(({ date }) => {
      const nextDate = date.clone();
      nextDate.add(1, 'day');
      return { date: nextDate };
    });
  }

  switchToPrevPage = () => {
    this.setState(({ date }) => {
      const prevDate = date.clone();
      prevDate.subtract(1, 'day');
      return { date: prevDate };
    });
  }

  render() {
    const rest = getUnhandledProps(MinutePicker, this.props);
    return (
      <MinuteView
        { ...rest }
        minutes={this.buildMinutes()}
        onNextPageBtnClick={this.switchToNextPage}
        onPrevPageBtnClick={this.switchToPrevPage}
        onMinuteClick={this.handleChange}
        hasNextPage={this.isNextPageAvailable()}
        hasPrevPage={this.isPrevPageAvailable()}
        currentDate={this.getCurrentDate()}
        active={this.getActiveMinute()} />
    );
  }
}

MinutePicker.propTypes = {
  /** Called after minute is selected. */
  onChange: PropTypes.func.isRequired,
  /** A value for initializing minute picker's state. */
  initializeWith: PropTypes.instanceOf(moment).isRequired,
  /** Currently selected minute. */
  value: PropTypes.instanceOf(moment),
  /** Array of disabled dates. */
  disable: PropTypes.arrayOf(
    PropTypes.instanceOf(moment)
  ),
  /** Minimal date that could be selected. */
  minDate: PropTypes.instanceOf(moment),
  /** Maximal date that could be selected. */
  maxDate: PropTypes.instanceOf(moment),
  /** Time format. */
  timeFormat: PropTypes.oneOf([
    'ampm', 'AMPM', '24',
  ]),
};

MinutePicker.defaultProps = {
  timeFormat: '24',
};

export default MinutePicker;
