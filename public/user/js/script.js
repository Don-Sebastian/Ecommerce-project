

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
      alert(response)
      if (response.status) {
          location.href= '/order-success'
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



