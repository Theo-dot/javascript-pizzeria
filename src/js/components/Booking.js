import {select, templates} from '../settings.js';
import {AmountWidget} from './AmountWidget.js';

export class Booking {
  constructor() {
    const thisBooking = this;
    thisBooking.render(document.querySelector(select.containerOf.booking));
    thisBooking.initWidgets();
  }

  render() {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = document.querySelector(
      select.containerOf.booking
    );
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.peopleAmount
    );
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.hoursAmount
    );
  }

  initWidgets() {
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
  }
}