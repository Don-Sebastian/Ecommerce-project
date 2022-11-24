/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-console */
/* eslint-disable func-names */
/* eslint-disable max-len */
/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-shadow */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
function addToCart(productId) {
  $.ajax({
    url: `/add-to-cartID/${productId}`,
    method: 'get',
    success: (response) => {
      if (response.status) {
        if (!response.statusInCart) {
          const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer);
              toast.addEventListener('mouseleave', Swal.resumeTimer);
            },
          });

          Toast.fire({
            icon: 'success',
            title: 'Item added to cart successfully',
          });
          let count = $('#cart-count').html();
          count = parseInt(count, 10) + 1;
          $('#cart-count').html(count);
          if (response.wishlistProductDeleted) {
            $(`#addedWishlist${productId}`).attr('hidden', true);
            $(`#removedWishlist${productId}`).removeAttr('hidden');
            let countwish = $('#wishlist-count').html();
            countwish = parseInt(countwish, 10) - 1;
            $('#wishlist-count').html(countwish);
            $(`#wishlistPage${productId}`).remove();
            if (countwish === 0) {
              setTimeout(() => {
                location.reload();
              }, 1000);
            }
          }
        }
      } else {
        location.href = '/login';
      }
    },
  });
}

function changeQuantity(cartId, productId, userId, count) {
  const quantity = parseInt(document.getElementById(productId).innerHTML, 10);
  const price = parseInt(document.getElementById(`${productId}-Price`).innerHTML, 10);
  count = parseInt(count, 10);
  $.ajax({
    url: '/change-product-quantity',
    data: {
      user: userId,
      cart: cartId,
      product: productId,
      count,
      quantity,
    },
    method: 'post',
    success: (response) => {
      // if (response.removeProduct) {
      //   alert("Product removed from cart");
      //   location.reload();
      // } else {
      document.getElementById(productId).innerHTML = quantity + count;
      const totolcount = quantity + count;
      prodIdRow = `#${productId}-tr`;
      if (quantity + count === 1) {
        $(`${prodIdRow} .btn-num-product-down`).addClass('disabled');
      } else {
        $(`${prodIdRow} .btn-num-product-down`).removeClass('disabled');
      }
      document.getElementById('total').innerHTML = response.total;
      document.getElementById(`${productId}-productAmount`).innerHTML = (quantity + count) * price;
      // }
    },
  });
}

function deleteFromCart(cartId, productId) {
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-danger',
    },
    buttonsStyling: false,
  });

  swalWithBootstrapButtons
    .fire({
      title: 'Are you sure?',
      text: 'You want to delete this product?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true,
    })
    .then((result) => {
      if (result.isConfirmed) {
        $.ajax({
          url: '/delete-from-cart',
          data: {
            cart: cartId,
            product: productId,
          },
          method: 'post',
          success: (response) => {
            if (response.removeProduct) {
              if (response.count === 0) {
                swalWithBootstrapButtons.fire(
                  'Deleted!',
                  'Your product has been deleted.',
                  'success',
                );
                setTimeout(() => {
                  location.reload();
                }, 1000);
              } else {
                swalWithBootstrapButtons.fire(
                  'Deleted!',
                  'Your product has been deleted.',
                  'success',
                );
                prodIdRow = `#${productId}-tr`;
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
          'Cancelled',
          'This product is safe :)',
          'error',
        );
      }
    });
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
  const address = $('input[name="AddressRadio"]:checked').val();
  const paymentMethod = $('input[name="payment-method"]:checked').val();
  $.ajax({
    url: '/place-order',
    method: 'post',
    data: {
      user: userId,
      addressId: address,
      paymentMethod,
    },
    success: (response) => {
      if (response.codSuccess) {
        location.href = '/order-success';
      } else if (response.razorPayStatus) {
        razorpayPayment(response);
      } else if (response.paypalStatus) {
        location.href = response.response;
      } else if (response.WalletStatus) {
        location.href = '/order-success';
      } else if (!(response.WalletStatus)) {
        $('#noBalanceWallet').removeAttr('hidden');
        document.getElementById('noBalanceWallet').innerHTML = 'Insufficent balance in Wallet';
      }
    },
  });
}

function razorpayPayment(order) {
  const options = {
    key: 'rzp_test_ABYYBYRSszOaqh', // Enter the Key ID generated from the Dashboard
    amount: order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    currency: 'INR',
    name: 'Fadonsta',
    description: 'Test Transaction',
    image: '/images/Fadonsta_LOGO-.png',
    order_id: order.id, // This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    handler(response) {
      verifyPayment(response, order);
    },
    prefill: {
      name: 'Don Seb',
      email: '',
      contact: '',
    },
    notes: {
      address: 'Fadonsta',
    },
    theme: {
      color: '#000000',
    },
  };
  const rzp1 = new Razorpay(options);
  rzp1.open();
}

function verifyPayment(payment, order) {
  $.ajax({
    url: '/verify-payment',
    data: {
      payment,
      order,
    },
    method: 'post',
    success: (response) => {
      if (response.status) {
        location.href = '/order-success';
      } else {
        // eslint-disable-next-line no-alert
        alert('Payment failed');
      }
    },
  });
}

// submit new password
function returnToPreviousPage() {
  window.history.back();
}

$('#newPasswordFormId').on('submit', function (e) {
  const formDetails = $(this).serialize();
  let status = true;
  if (
    $('#oldPassword').val() === '' || $('#newPassword').val() === '' || $('#newPasswordConfirm').val() === '') {
    console.log($('#oldPassword').val());
    // check 2
    // returnToPreviousPage();

    status = false;
    console.log('This field should not be empty ');
    e.preventDefault();
  }
  if ($('#oldPassword').val() === $('#newPassword').val()) {
    // check 1
    // eslint-disable-next-line no-alert
    alert('This Is Your Old Password,Please Provide A New Password');
    // returnToPreviousPage();
    status = false;
    console.log('This Is Your Old Password,Please Provide A New Password');
    document.getElementById('oldNewPasswordCheck').innerHTML = 'This Is Your Old Password,Please Provide A New Password';
    e.preventDefault();
  }
  if ($('#newPassword').val() !== $('#confirmPassword').val()) {
    // check 3
    // returnToPreviousPage();
    console.log($('#newPassword').val());
    console.log($('#confirmPassword').val());
    status = false;
    console.log('Confirm password is not same as you new password.');

    document.getElementById('passwordConfirmationCheck').innerHTML = 'Confirm password is not same as you new password.';
    e.preventDefault();
  }
  if (status) {
    e.preventDefault();
    $.ajax({
      url: '/reset-profile-password',
      data: formDetails,
      method: 'post',
      success: (response) => {
        if (response.status) {
          swal('Password changed successfully!', '', 'success').then((success) => {
            if (success) {
              location.reload();
            }
          });
        }
      },
    });
  }
});

function newPassword(e) {
  e.preventDefault();
  const formDetails = document.getElementById('newPasswordFormId').submit();
  // eslint-disable-next-line no-alert
  alert(formDetails);
}

function editAddressSWT(e) {
  e = e || window.event;
  e.preventDefault();
  swal("Can't edit, Only delete", 'Will be updated');
}

function deleteAddressSWT(addressId, e) {
  e.preventDefault();
  swal({
    title: 'Are you sure this address?',
    text: 'This action is irrevesible',
    icon: 'warning',
    buttons: true,
    dangerMode: true,
  }).then((willDelete) => {
    if (willDelete) {
      $.ajax({
        url: `/delete-address/${addressId}`,
        method: 'post',
        success: (response) => {
          if (response.status) {
            swal('Poof! Address has been deleted!', {
              icon: 'success',
            });
            $(`#${addressId}`).remove();
          } else {
            swal('Addess not deleted', {
              icon: 'success',
            });
          }
        },
      });
    } else {
      swal('Address is safe!');
    }
  });
}

function changeProductOrder(productId, orderId, value) {
  $.ajax({
    url: '/update-OrderStatus',
    data: {
      productId,
      orderId,
      value,
    },
    method: 'post',
    success: (response) => {
      if (response.status) {
        location.reload();
      }
    },
  });
}

$('#submitCoupon').click((event) => {
  event.preventDefault();
  const form = $('#formCoupon');
  const url = form.attr('action');
  const method = form.attr('method');
  $.ajax({
    url: '/apply-coupon',
    method: 'post',
    data: form.serialize(),
    success: (response) => {
      if (response.couponStatus === false) {
        $('#successMessageCoupon').attr('hidden', true);
        $('#errorMessageCoupon').removeAttr('hidden');
        document.getElementById('errorMessageCoupon').innerHTML = response.couponResponse;
      } else {
        $('#successMessageCoupon').removeAttr('hidden');
        document.getElementById('finalGrandTotal').innerHTML = response.grandTotal;
      }
    },
  });
});

$(document).ready(() => {
  $('#orderListUser').DataTable({});
});

// WISHLIST
function addToWishlist(productId) {
  $.ajax({
    url: `/add-to-wishlist/${productId}`,
    method: 'get',
    success: (response) => {
      if (response.status) {
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          },
        });
        if (response.added) {
          Toast.fire({
            icon: 'success',
            title: 'Item added to your wishlist successfully',
          });
          $(`#removedWishlist${productId}`).attr('hidden', true);
          $(`#addedWishlist${productId}`).removeAttr('hidden');
          let count = $('#wishlist-count').html();
          count = parseInt(count, 10) + 1;
          $('#wishlist-count').html(count);
        } else {
          Toast.fire({
            icon: 'success',
            title: 'Item deleted from your wishlist successfully',
          });
          $(`#addedWishlist${productId}`).attr('hidden', true);
          $(`#removedWishlist${productId}`).removeAttr('hidden');
          let count = $('#wishlist-count').html();
          count = parseInt(count, 10) - 1;
          $('#wishlist-count').html(count);
          $('#reloadwishlist').load(`${location.href} #reloadwishlist`);
        }
      } else {
        location.href = '/login';
      }
    },
  });
}

function searchProduct(e) {
  const search = document.getElementById('searchProductbyName');
  const searchResults = document.getElementById('searchResults');
  const match = e.value.match(/^[a-zA-Z]*/);
  const match2 = e.value.match(/\s*/);
  if (match2[0] === e.value) {
    searchResults.innerHTML = '';
  } else if (match[0] === e.value) {
    fetch('search-product', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload: e.value }),
    })
      .then((response) => response.json())
      .then((data) => {
        const { payload } = data;
        searchResults.innerHTML = '';
        if (payload.length < 1) {
          searchResults.innerHTML = '<p class="text-danger">Sorry. Nothing Found.</p>';
        }
        payload.forEach((item, index) => {
          if (index > 0) {
            searchResults.innerHTML += '<hr>';
            // eslint-disable-next-line no-template-curly-in-string, no-underscore-dangle
            searchResults.innerHTML += `<a href="/product-detailID/${item._id}"><p>${item.Name}</p></a>`;
          }
        });
      });
  }
  searchResults.innerHTML = '';
}
