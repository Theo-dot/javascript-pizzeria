import {Product} from './components/Product.js';
import {Cart} from './components/Cart.js';
import {select, settings, classNames} from './settings.js';
import {Booking} from './components/Booking.js';

const app = {
  initData: function() {
    const thisApp = this,
      url = `${settings.db.url}/${settings.db.product}`;

    thisApp.data = {};

    fetch(url).then(rawResponse => rawResponse.json()).then(parsedResponse => {
      thisApp.data.products = parsedResponse;
      thisApp.initMenu();
    });
  },

  initMenu: function() {
    const thisApp = this;
    for (let productData in thisApp.data.products) {
      new Product(
        thisApp.data.products[productData].id,
        thisApp.data.products[productData]
      );
    }
  },

  initCart: function() {
    const thisApp = this,
      cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);
    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function(event) {
      app.cart.add(event.detail.product);
    });
  },

  initPages: function() {
    const thisApp = this;
    let pagesMatchingHash = [];

    thisApp.pages = Array.from(
      document.querySelector(select.containerOf.pages).children
    );
    thisApp.navLinks = Array.from(document.querySelectorAll(select.nav.links));

    if (window.location.hash.length > 2) {
      const idFromHash = window.location.hash.replace('#/', '');

      pagesMatchingHash = thisApp.pages.filter(function(page) {
        return page.id == idFromHash;
      });
    }

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function(event) {
        const clickedElement = this;
        event.preventDefault();
        const id = clickedElement.getAttribute('href');
        const pageId = id.replace('#', '');

        thisApp.activatePage(pageId);
      });
    }
  },

  initBooking: function() {
    const thisApp = this;
    const bookingElem = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(bookingElem);
  },

  activatePage(pageId) {
    const thisApp = this;
    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
    for (let link of thisApp.pages) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('id') == pageId
      );
    }
    window.location.hash = '#/' + pageId;
  },

  init: function() {
    const thisApp = this;
    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
  },
};

app.init();
