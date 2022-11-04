


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
          console.log(response);
          console.log(orderId + "-orderStatus-" + response.orderStatus);
          document.getElementById(orderId + "-orderStatus-" + response.orderStatus).innerHTML = response.orderStatus;
      }
    },
  });
}

