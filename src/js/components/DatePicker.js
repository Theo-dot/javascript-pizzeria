/* eslint-disable no-unused-vars */
/* global flatpickr */

import {select, settings} from '../settings.js';
import {BaseWidget} from './BaseWidget.js';
import {utils} from '../utils.js';

export class DatePicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, utils.dateToStr(new Date()));

    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(
      select.widgets.datePicker.input
    );
    thisWidget.initPlugin();
  }

  initPlugin() {
    const thisWidget = this;
    thisWidget.minDate = new Date(thisWidget.value);
    thisWidget.maxDate = utils.addDays(
      thisWidget.minDate,
      settings.datePicker.maxDaysInFuture
    );

    flatpickr(thisWidget.dom.input, {
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      onChange: function(selectedDates, dateStr, instance){
        thisWidget.value = dateStr;
      },
      disable: [
        function(date) {
          return date.getDay() === 1;
        },
      ],
      locate: {
        firstDayofWeek: 1,
      },
    });
  }

  parseValue(newValue) {
    const thisWidget = this;
  }

  isValid(newValue) {
    const thisWidget = this;
    return true;
  }

  renderValue() {
    const thisWidget = this;
  }
}
