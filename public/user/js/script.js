
function addToCart(productId) {
  $.ajax({
    url: "/add-to-cartID/" + productId,
    method: "get",
    success: (response) => {
      if (response.status) {
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", Swal.stopTimer);
            toast.addEventListener("mouseleave", Swal.resumeTimer);
          },
        });

        Toast.fire({
          icon: "success",
          title: "Item added to cart successfully",
        });
        let count = $("#cart-count").html();
        count = parseInt(count) + 1;
        $("#cart-count").html(count);
      } else {
        location.href = "/login";
      }
    },
  });
  
  
}

function changeQuantity(cartId, productId, userId, count) {
  let quantity = parseInt(document.getElementById(productId).innerHTML);
  let price = parseInt(document.getElementById(productId + "-Price").innerHTML);
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
      let totolcount = quantity + count;
      console.log(totolcount);
      prodIdRow = "#" + productId + "-tr";
      if (quantity + count == 1) {
        $(prodIdRow + " .btn-num-product-down").addClass("disabled");
      } else {
        $(prodIdRow + " .btn-num-product-down").removeClass("disabled");
      }
      document.getElementById("total").innerHTML = response.total;
      document.getElementById(productId + "-productAmount").innerHTML =
        (quantity + count) * price;
      // }
    },
  });
}

function deleteFromCart(cartId, productId) {
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success",
      cancelButton: "btn btn-danger",
    },
    buttonsStyling: false,
  });

  swalWithBootstrapButtons
    .fire({
      title: "Are you sure?",
      text: "You want to delete this product?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
    })
    .then((result) => {
      if (result.isConfirmed) {
        
        $.ajax({
          url: "/delete-from-cart",
          data: {
            cart: cartId,
            product: productId,
          },
          method: "post",
          success: (response) => {
            if (response.removeProduct) {
              if (response.count == 0) {
                swalWithBootstrapButtons.fire(
                  "Deleted!",
                  "Your product has been deleted.",
                  "success"
                );
                setTimeout(function () {
                  location.reload();
                },1000)
              }
              else {
                swalWithBootstrapButtons.fire(
                  "Deleted!",
                  "Your product has been deleted.",
                  "success"
                );
                prodIdRow = "#" + productId + "-tr";
                $(prodIdRow).remove();
              }
            }
          },
        });
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          "Cancelled",
          "This product is safe :)",
          "error"
        );
      }
    });
  // ============================
  // swal({
  //   title: "Are you sure?",
  //   text: "",
  //   icon: "warning",
  //   buttons: true,
  //   dangerMode: true,
  // }).then((willDelete) => {
  //   if (willDelete) {
  //     ;
      
  //   } else {
  //     swal("This product is safe!");
  //   }
  // });
  
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
      paymentMethod: paymentMethod,
    },
    success: (response) => {
      if (response.codSuccess) {
        location.href = "/order-success";
      } else if (response.razorPayStatus) {
        razorpayPayment(response);
      } else if (response.paypalStatus) {
        location.href = response.response
      }
    },
  });
}

function razorpayPayment(order) {
  var options = {
    key: "rzp_test_ABYYBYRSszOaqh", // Enter the Key ID generated from the Dashboard
    amount: order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    currency: "INR",
    name: "Fadonsta",
    description: "Test Transaction",
    image: "/images/Fadonsta_LOGO-.png",
    order_id: order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    handler: function (response) {
      verifyPayment(response, order);
    },
    prefill: {
      name: "Don Seb",
      email: "donseb@gmail.com",
      contact: "9947722703",
    },
    notes: {
      address: "Fadonsta",
    },
    theme: {
      color: "#000000",
    },
  };
  var rzp1 = new Razorpay(options);
  rzp1.open();
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
        alert("Payment failed");
      }
    },
  });
}

// submit new password
function returnToPreviousPage() {
  window.history.back();
}


$("#newPasswordFormId").on("submit", function (e) {
  let formDetails = $(this).serialize();
  let status = true;
  if (
    $("#oldPassword").val() == "" ||
    $("#newPassword").val() == "" ||
    $("#newPasswordConfirm").val() == ""
  ) {
    console.log($("#oldPassword").val());
    //check 2
    // returnToPreviousPage();

    status = false;
    console.log("This field should not be empty ");
    e.preventDefault();
  }
  if ($("#oldPassword").val() == $("#newPassword").val()) {
    //check 1
    alert("This Is Your Old Password,Please Provide A New Password");
    // returnToPreviousPage();
    status = false;
    console.log("This Is Your Old Password,Please Provide A New Password");
    document.getElementById("oldNewPasswordCheck").innerHTML =
      "This Is Your Old Password,Please Provide A New Password";
    e.preventDefault();
  }
  if ($("#newPassword").val() != $("#confirmPassword").val()) {
    //check 3
    // returnToPreviousPage();
    console.log($("#newPassword").val());
    console.log($("#confirmPassword").val());
    status = false;
    console.log("Confirm password is not same as you new password.");

    document.getElementById("passwordConfirmationCheck").innerHTML =
      "Confirm password is not same as you new password.";
    e.preventDefault();
  }
  if (status) {
     e.preventDefault();
    $.ajax({
      url: "/reset-profile-password",
      data: formDetails,
      method: "post",
      success: (response) => {
        if (response.status) {
          
          swal("Password changed successfully!", "", "success").then((success) => {
            if (success) {
              location.reload();
            }
          })
          
        }
      },
    });
  }
});

function newPassword(e) {
  e.preventDefault();
  let formDetails = document.getElementById("newPasswordFormId").submit();
  alert(formDetails);
  
}

function editAddressSWT(e) {
  e = e || window.event;
  e.preventDefault();
  swal("Can't edit, Only delete", "Will be updated");
}

function deleteAddressSWT(addressId, e) {
  e.preventDefault();
  swal({
    title: "Are you sure this address?",
    text: "This action is irrevesible",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then((willDelete) => {
    if (willDelete) {
      $.ajax({
        url: "/delete-address/" + addressId,
        method: "post",
        success: (response) => {
          if (response.status) {
            swal("Poof! Address has been deleted!", {
              icon: "success",
            });
            $("#" + addressId).remove();
          } else {
            swal("Addess not deleted", {
              icon: "success",
            });
          }
        },
      });
    } else {
      swal("Address is safe!");
    }
  });
}

function changeProductOrder(productId, orderId, value) {
  swal({
    title: "Are you sure?",
    text: "Once "+ value+ ", you will not be able to change the desicion!",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then((willDelete) => {
    if (willDelete) {
      $.ajax({
        url: "/update-OrderStatus",
        data: {
          productId: productId,
          orderId: orderId,
          value: value,
        },
        method: "post",
        success: (response) => {
          if (response.status) {
            location.reload();
            swal("Poof! Your has been " + response.productStatus + "!", {
              icon: "success",
            });
            
          } else {
            swal("Poof! Your has not been " + response.productStatus + "!");
          }
        },
      });
      
    } else {
      swal("Your product will not be "+value+"!");
    }
  });
  
}