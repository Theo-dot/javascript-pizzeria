/* eslint-disable no-unused-vars */
import {select, templates, settings, classNames} from '../settings.js';
import {AmountWidget} from './AmountWidget.js';
import {DatePicker} from './DatePicker.js';
import {HourPicker} from './HourPicker.js';
import {utils} from '../utils.js';

export class Booking {
  constructor() {
    const thisBooking = this;
    thisBooking.render();
    thisBooking.initWidgets();
    thisBooking.getData();
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
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.datePicker.wrapper
    );
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.hourPicker.wrapper
    );
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
  }

  initWidgets() {
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.datePicker.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    thisBooking.dom.hourPicker.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });
  }

  getData() {
    const thisBooking = this;

    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(
      thisBooking.datePicker.minDate
    );
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(
      thisBooking.datePicker.maxDate
    );

    const endDate = {};
    endDate[settings.db.dateEndParamKey] =
      startEndDates[settings.db.dateEndParamKey];

    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent:
        settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };

    console.log('getData params', params);

    const urls = {
      booking:
        settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent:
        settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat:
        settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };

    console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(
        [bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]
      ) {
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]) {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;
    thisBooking.booked = {};

    for (let event of eventsCurrent) {
      thisBooking.makeBooked(
        event.date,
        event.hour,
        event.duration,
        event.table
      );
    }

    for (let booking of bookings) {
      thisBooking.makeBooked(
        booking.date,
        booking.hour,
        booking.duration,
        booking.table
      );
    }

    for (let eventRepeat of eventsRepeat) {
      thisBooking.maxDate = utils.dateToStr(thisBooking.datePicker.maxDate);
      thisBooking.minDate = utils.dateToStr(thisBooking.datePicker.minDate);

      for (
        let i = thisBooking.minDate;
        i < thisBooking.maxDate;
        i = utils.dateToStr(utils.addDays(i, 1))
      ) {
        thisBooking.makeBooked(
          i,
          eventRepeat.hour,
          eventRepeat.duration,
          eventRepeat.table
        );
      }
    }
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this,
      newHour = utils.hourToNumber(hour);

    for (let i = newHour; i < newHour + duration; i += 0.5) {
      if (thisBooking.booked[date]) {
        if (thisBooking.booked[date][i]) {
          thisBooking.booked[date][i].push(table);
        } else {
          thisBooking.booked[date][i] = [table];
        }
      } else {
        thisBooking.booked[date] = {
          [newHour]: [table],
        };
      }
    }
  }

  updateDOM() {
    const thisBooking = this;
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    for (let table of thisBooking.dom.tables){
      const tableNumber = parseInt(table.getAttribute(settings.booking.tableIdAttribute));

      if (thisBooking.booked[thisBooking.date] && thisBooking.booked[thisBooking.date][thisBooking.hour] && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableNumber)){
        table.classList.add(classNames.booking.tableBooked);
      }
      else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }
}
