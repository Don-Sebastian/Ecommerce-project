function addToCart(productId) {
  $.ajax({
    url: "/add-to-cartID/"+productId,
    method: "get",
      success: (response) => {
          if (response.status) {
              let count = $('#cart-count').html()
              count = parseInt(count) + 1
              $('#cart-count').html(count)
        }
      },
  });
}


function changeQuantity(cartId, productId, count) {
  $.ajax({
    url: '/change-product-quantity',
    data: {
      cart: cartId,
      product: productId,
      count: count,
    },
    method: 'post',
    success: (response) => {
      alert(response)
    }
  })
}