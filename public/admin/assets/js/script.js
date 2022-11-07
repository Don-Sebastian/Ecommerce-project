


function changeOrderStatus(orderId) {
  let orderStatus = document.getElementById( orderId+"-select").value;
  $.ajax({
    url: "/admin/update-orderStatus",
    method: "POST",
    data: {
      orderId: orderId,
      orderStatus: orderStatus,
    },
    success: (response) => {
        if (response.status) {
          location.reload();
      }
    },
  });
}


function changeProductOrderStatus(productId, orderId) {
  let productOrderStatus = document.getElementById(orderId + "-" + productId + "-select").value;
  $.ajax({
    url: "/admin/update-product-order-status",
    method: "POST",
    data: {
      orderId: orderId,
      productId: productId,
      value: productOrderStatus,
    },
    success: (response) => {
      if (response.status) {
        location.reload();
      }
    },
  });
}

function changeProductOrderStatusButton(productId, orderId, value) {
  $.ajax({
    url: "/admin/update-product-order-status",
    method: "POST",
    data: {
      orderId: orderId,
      productId: productId,
      value: value,
    },
    success: (response) => {
      if (response.status) {
        location.reload();
      }
    },
  });
}
