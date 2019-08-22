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
    const thisBooking = this,
      generatedHTML = templates.bookingWidget();
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
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(
      select.booking.tables
    );
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(
      select.booking.starters
    );
  }

  initWidgets() {
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.table = [];

    thisBooking.dom.datePicker.addEventListener('updated', function() {
      thisBooking.updateDOM();
    });

    thisBooking.dom.hourPicker.addEventListener('updated', function() {
      thisBooking.updateDOM();
    });
    thisBooking.tableBooking();

    thisBooking.submitBooking = thisBooking.dom.wrapper.querySelector(
      select.booking.bookingSubmit
    );
    thisBooking.submitBooking.addEventListener('click', function() {
      event.preventDefault();
      thisBooking.sendOrder();
      thisBooking.tableBooking();
    });

    thisBooking.starters = [];

    for (let starter of thisBooking.dom.starters) {
      starter.addEventListener('change', function() {
        if (this.checked) {
          thisBooking.starters.push(starter.value);
        } else {
          thisBooking.starters.splice(
            thisBooking.starters.indexOf(starter.value),
            1
          );
        }
      });
    }
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
      eventsCurrent: `${settings.db.notRepeatParam}&${utils.queryParams(
        startEndDates
      )}`,
      eventsRepeat: `${settings.db.repeatParam}&${utils.queryParams(endDate)}`,
    };

    console.log('getData params', params);

    const urls = {
      booking: `${settings.db.url}/${settings.db.booking}?${params.booking}`,
      eventsCurrent: `${settings.db.url}/${settings.db
        .event}?${params.eventsCurrent}`,
      eventsRepeat: `${settings.db.url}/${settings.db
        .event}?${params.eventsRepeat}`,
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
    thisBooking.hourSlider();
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

  tableBooking() {
    const thisBooking = this;

    for (let table of thisBooking.dom.tables) {
      table.addEventListener('click', function() {
        const idTable = table.getAttribute('data-table');

        if (!table.classList.contains(classNames.booking.tableBooked)) {
          table.classList.toggle(classNames.booking.tableBooked);
          if (thisBooking.table.indexOf(idTable) === -1) {
            thisBooking.table.push(idTable);
          } else {
            thisBooking.table.splice(thisBooking.table.indexOf(idTable), 1);
          }
        }
      });
    }
  }

  updateDOM() {
    const thisBooking = this;
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    for (let table of thisBooking.dom.tables) {
      const tableNumber = parseInt(
        table.getAttribute(settings.booking.tableIdAttribute)
      );

      if (
        thisBooking.booked[thisBooking.date] &&
        thisBooking.booked[thisBooking.date][thisBooking.hour] &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(
          tableNumber
        )
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
    thisBooking.dom.datePicker.addEventListener('updated', function() {
      thisBooking.hourSlider(thisBooking.date);
    });
  }

  sendOrder() {
    const thisBooking = this,
      url = `${settings.db.url}/${settings.db.booking}`,
      payload = {
        date: thisBooking.datePicker.value,
        hour: thisBooking.hourPicker.value,
        table: thisBooking.table,
        people: thisBooking.peopleAmount.value,
        duration: thisBooking.hoursAmount.value,
        starters: thisBooking.starters,
      };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response) {
        return response.json();
      })
      .then(function(parsedResponse) {
        console.log('parsedResponse', parsedResponse);

        thisBooking.makeBooked(
          payload.date,
          payload.hour,
          payload.duration,
          payload.table
        );
      });
  }

  hourSlider() {
    const thisBooking = this,
      slider = document.querySelector('.rangeSlider__fill'),
      range = document.createElement('div');

    range.classList.add('time-range');
    slider.appendChild(range);

    thisBooking.date = thisBooking.datePicker.value;

    for (let i = 12; i < 24; i = i + 0.5) {
      const colorPart = document.createElement('div');
      colorPart.classList.add('part-of-time');
      colorPart.setAttribute('data-tag', i);
      range.appendChild(colorPart);
    }
    thisBooking.timeparts = Array.from(
      document.querySelector('.time-range').children
    );

    for (let timepart of thisBooking.timeparts) {
      const part = timepart.getAttribute('data-tag');
      timepart.classList.remove('allFree', 'oneFree', 'allTaken');

      for (let i = 12; i < 24; i = i + 0.5) {
        if (
          (part == i &&
            typeof thisBooking.booked[thisBooking.date][i] == 'undefined') ||
          (part == i && thisBooking.booked[thisBooking.date][i].length === 1)
        ) {
          timepart.classList.add('allFree');
        } else if (
          part == i &&
          thisBooking.booked[thisBooking.date][i].length === 2
        ) {
          timepart.classList.add('oneFree');
        } else if (
          part == i &&
          thisBooking.booked[thisBooking.date][i].length === 3
        ) {
          timepart.classList.add('allTaken');
        }
      }
    }
  }
}
