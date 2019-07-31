import {Product} from './components/Product.js';
import {Cart} from './components/Cart.js';
import {select, settings} from './settings.js';

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

  init: function() {
    const thisApp = this;
    thisApp.initData();
    thisApp.initCart();
  },
};

app.init();
