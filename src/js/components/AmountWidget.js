import {select, settings} from '../settings.js';

export class AmountWidget {
  constructor(element) {
    const thisWidget = this;
    thisWidget.value = settings.amountWidget.defaultValue;
    thisWidget.getElements(element);
    thisWidget.setValue(thisWidget.input.value);
    thisWidget.initActions();
    thisWidget.announce();
  }

  getElements(element) {
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(
      select.widgets.amount.input
    );
    thisWidget.linkDecrease = thisWidget.element.querySelector(
      select.widgets.amount.linkDecrease
    );
    thisWidget.linkIncrease = thisWidget.element.querySelector(
      select.widgets.amount.linkIncrease
    );
  }

  setValue(value) {
    const thisWidget = this,
      newValue = parseInt(value);

    if (newValue !== thisWidget.value && newValue >= 1 && newValue <= 9) {
      thisWidget.value = newValue;
      thisWidget.announce();
    }
    thisWidget.input.value = thisWidget.value;
  }

  initActions() {
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function() {
      event.preventDefault();
      thisWidget.setValue(thisWidget.input.value);
    });

    thisWidget.linkDecrease.addEventListener('click', function(event) {
      event.preventDefault();
      const valueDecrease = thisWidget.value - 1;
      thisWidget.setValue(valueDecrease);
    });

    thisWidget.linkIncrease.addEventListener('click', function(event) {
      event.preventDefault();
      const valueIncrease = thisWidget.value + 1;
      thisWidget.setValue(valueIncrease);
    });
  }

  announce() {
    const thisWidget = this;
    const event = new Event('updated', {
      bubbles: true,
    });

    thisWidget.element.dispatchEvent(event);
  }
}
