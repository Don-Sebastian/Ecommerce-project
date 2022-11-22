/* eslint-disable no-undef */
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
const paypal = require('paypal-rest-sdk');
const orderHelper = require('../../helpers/order-helpers');
const cartHelpers = require('../../helpers/cart-helpers');
const userHelpers = require('../../helpers/user-helpers');

let id;

exports.getPaymentMethod = async (req, res) => {
  const cartItems = await cartHelpers.getCartProductsList(req.body.user);
  let totalPrice = 0;
  // eslint-disable-next-line no-undef
  if (products.length > 0) {
    totalPrice = await cartHelpers.getTotalAmount(req.body.user, req.session.couponOffer);
  }
  orderHelper
    .placeOrder(req.body, cartItems, totalPrice)
    .then(async (orderId) => {
      if (req.body.paymentMethod === 'COD') {
        res.json({ codSuccess: true });
      } else if (req.body.paymentMethod === 'razorpay') {
        await orderHelper
          .generateRazorpay(orderId, totalPrice, req.session.user._id)
          .then((response) => {
            response.razorPayStatus = true;
            res.json(response);
          })
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.log(err);
          });
      } else if (req.body.paymentMethod === 'paypal') {
        // eslint-disable-next-line no-undef
        totalPricePaypal = totalPrice;
        await orderHelper.generatePaypal(orderId, totalPrice, req.session.user._id).then((response) => {
          res.json({ response, paypalStatus: true });
        }).catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err);
        });
      } else if (req.body.paymentMethod === 'Wallet') {
        const userWalletAmount = await userHelpers.walletAmount(req.session.user._id);
        if (userWalletAmount > totalPrice) {
          await userHelpers.payUsingWallet(req.session.user._id, totalPrice).then(() => {
            orderHelper.changePaymentStatus(orderId).then(() => {
              res.json({ WalletStatus: true });
            });
          });
        } else {
          res.json({ WalletStatus: false });
        }
      }
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
    });
};

exports.getOrderSuccess = (req, res) => {
  res.render('users/order-success', {
    adminAccount: false,
    navbar: true,
    footer: true,
    cartCount,
  });
};

exports.getOrderDetails = async (req, res) => {
  req.session.couponOffer = false;
  const orders = await orderHelper.getUserOrders(req.session.user._id);
  res.render('users/orders', {
    adminAccount: false,
    navbar: true,
    footer: true,
    cartCount,
    orders,
  });
};

exports.getViewOrderProductsID = (req, res) => {
  id = req.params.id;
  res.redirect('/view-order-products');
};

exports.getViewOrderProducts = async (req, res) => {
  const products = await orderHelper.getOrderProducts(id);
  const order = await orderHelper.orderDetails(id);
  res.render('users/view-Order-Products', {
    adminAccount: false,
    navbar: true,
    footer: true,
    cartCount,
    products,
    order,
  });
};

exports.postVerifyPayment = (req, res) => {
  orderHelper.verifyPayment(req.body).then(() => {
    orderHelper
      .changePaymentStatus(req.body['order[receipt]'])
      .then(() => {
        // eslint-disable-next-line no-console
        console.log('Payment Successfull');
        res.json({ status: true });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
      });
  }).catch((err) => {
    // eslint-disable-next-line no-console
    console.log(err);
    res.json({ status: false, errMsg: '' });
  });
};

exports.getSuccessPaypal = async (req, res) => {
  const payerId = req.query.PayerID;
  const { paymentId } = req.query;

  // eslint-disable-next-line camelcase
  const execute_payment_json = {
    payer_id: payerId,
  };
  // Obtains the transaction details from paypal
  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    (error, payment) => {
      // When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
      if (error) {
        // eslint-disable-next-line no-console
        console.log(error.response);
        throw error;
      } else {
        orderHelper
          .changePaymentStatus(payment.transactions[0].description)
          .then(() => {
            // console.log(JSON.stringify(payment));
            res.redirect('/order-success');
          });
      }
    },
  );
};

exports.getCancelPaypal = (req, res) => {
  res.redirect('/checkout');
};

exports.postUpdateProductOrderStatus = (req, res) => {
  orderHelper.updateProductOrderStatus(req.body).then((response) => {
    res.json(response);
  });
};

exports.getAdminViewOrders = async (req, res) => {
  const orders = await orderHelper.getOrdersAdmin();
  res.render('admin/view-orders', {
    adminAccount: true,
    scrollbar: true,
    orders,
    admin,
  });
};

exports.postUpdateOrderStatus = (req, res) => {
  orderHelper.updateOrderStatus(req.body).then((response) => {
    res.json(response);
  });
};

exports.getAdminProductOrderID = (req, res) => {
  id = req.params.id;
  res.redirect('/admin/view-order-products-admin');
};

exports.getAdminOrderProducts = async (req, res) => {
  const products = await orderHelper.getOrderProducts(id);
  const order = await orderHelper.orderDetails(id);
  res.render('admin/view-order-products', {
    adminAccount: true,
    scrollbar: true,
    admin,
    products,
    order,
  });
};

exports.postAdminOrderProducts = (req, res) => {
  orderHelper.updateProductOrderStatus(req.body).then(() => {
    res.json({ status: true });
  });
};
