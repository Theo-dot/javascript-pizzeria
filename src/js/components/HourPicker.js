/* eslint-disable no-unused-vars */
/* global rangeSlider */
import {BaseWidget} from './BaseWidget.js';
import {select, settings} from '../settings.js';
import {utils} from '../utils.js';

export class HourPicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, settings.hours.open);

    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(
      select.widgets.hourPicker.input
    );
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(
      select.widgets.hourPicker.output
    );
    thisWidget.initPlugin();
    thisWidget.value = thisWidget.dom.input.value;
  }

  initPlugin() {
    const thisWidget = this;

    rangeSlider.create(thisWidget.dom.input);

    thisWidget.dom.input.addEventListener('input', function(event) {
      thisWidget.value = thisWidget.dom.input.value;
    });
  }

  parseValue(newValue) {
    const thisWidget = this;

    return utils.numberToHour(newValue);
  }

  isValid(newValue){
    const thisWidget = this;

    return true;
  }

  renderValue() {
    const thisWidget = this;

    thisWidget.dom.output.innerHTML = thisWidget.value;
  }

}
