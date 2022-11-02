

function addToCart(productId) {
  $.ajax({
    url: "/add-to-cartID/" + productId,
    method: "get",
    success: (response) => {
      if (response.status) {
        let count = $("#cart-count").html();
        count = parseInt(count) + 1;
        $("#cart-count").html(count);
      }
    },
  });
}

function changeQuantity(cartId, productId,userId, count) {
  let quantity = parseInt(document.getElementById(productId).innerHTML);
  let price = parseInt(document.getElementById(productId+"-Price").innerHTML);
  count = parseInt(count);

  $.ajax({
    url: "/change-product-quantity",
    data: {
      user: userId,
      cart: cartId,
      product: productId,
      count: count,
      quantity: quantity,
    },
    method: "post",
    success: (response) => {
      // if (response.removeProduct) {
      //   alert("Product removed from cart");
      //   location.reload();
      // } else {
      document.getElementById(productId).innerHTML = quantity + count;
      let totolcount = quantity + count
      console.log(totolcount);
      prodIdRow = "#" + productId + "-tr";
      if (quantity + count == 1) {
        $(prodIdRow + " .btn-num-product-down").addClass("disabled");
      } else {
        $(prodIdRow + " .btn-num-product-down").removeClass("disabled");
      }
      document.getElementById("total").innerHTML = response.total
      document.getElementById(productId + "-productAmount").innerHTML = (quantity + count) * price;
      // }
    },
  });
}

function deleteFromCart(cartId, productId) {
  $.ajax({
    url: "/delete-from-cart",
    data: {
      cart: cartId,
      product: productId
    },
    method: "post",
    success: (response) => {
      console.log(response)
      if (response.removeProduct) {
        alert("Product removed from cart");
        // location.reload();
        //console.log(response.productId);
        prodIdRow = "#" + productId + "-tr";
        $(prodIdRow).remove();
        
      }
      
    }
  })
}

// proceed to checkout COD

function proceedToCheckout(userId) {
  let address = $('input[name="AddressRadio"]:checked').val();
  let paymentMethod = $('input[name="payment-method"]:checked').val();
  $.ajax({
    url: "/place-order",
    method: "post",
    data: {
      user: userId,
      addressId: address,
      paymentMethod: paymentMethod
    },
    success: (response) => {
      if (response.codSuccess) {
        location.href = "/order-success";
      } else {
        razorpayPayment(response);
      }
    }
  });
}


function razorpayPayment(order) {
  var options = {
    key: "rzp_test_ABYYBYRSszOaqh", // Enter the Key ID generated from the Dashboard
    amount: order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    currency: "INR",
    name: "Fadonsta",
    description: "Test Transaction",
    image: "https://example.com/your_logo",
    order_id: order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    handler: function (response) {
      verifyPayment(response, order);
    },
    prefill: {
      name: "Gaurav Kumar",
      email: "gaurav.kumar@example.com",
      contact: "9999999999",
    },
    notes: {
      address: "Razorpay Corporate Office",
    },
    theme: {
      color: "#3399cc",
    },
  };
  var rzp1 = new Razorpay(options);
  rzp1.open();
  rzp1.on("payment.failed", function (response) {
    verifyPayment(response, order);
  });
      

}

function verifyPayment(payment, order) {
  $.ajax({
    url: "/verify-payment",
    data: {
      payment,
      order,
    },
    method: "post",
    success: (response) => {
      if (response.status) {
        location.href = "/order-success";
      } else {
        alert('Payment failed')
      }
    }
  });
}

// }

// jquery COD ONLINE checkout form

// $("#checkout-form").submit((e) => {
//   e.preventDefault()
//   $.ajax({
//     url: '/place-order',
//     method: 'post',
//     data: $('#checkout-form').serialize(),
//     success: (response) => {
//       alert(response)
//     }
//   })
// });



