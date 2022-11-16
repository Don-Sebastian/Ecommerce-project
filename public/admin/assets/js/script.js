function removeProductAdmin(productId) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "/admin/delete-product/" + productId,
        method: "get",
        success: (response) => {
          if (response.status) {
            Swal.fire("Deleted!", "Your file has been deleted.", "success");
            setTimeout(() => {
              location.href = "/admin/view-products";
            }, 2000);
          }
        },
      });
    }
  });
}

function removeCouponAdmin(couponId) {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: "/admin/delete-coupon/" + couponId,
        method: "get",
        success: (response) => {
          if (response.status) {
            Swal.fire("Deleted!", "Your file has been deleted.", "success");
            setTimeout(() => {
              location.href = "/admin/admin-coupons";
            }, 2000);
          }
        },
      });
    }
  });
}

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

function removeImageInEdit(imageName, categoryId) {
  $.ajax({
    url: "//remove-image-category",
    method: "post",
    data: {
      imageName: imageName,
      categoryId: categoryId,
    },
    success: (response) => {},
  });
}

$("#category-selection").on("change", function () {
  
  var optionSelected = this.value;
  $.ajax({
    url: "/admin/category-subcategory",
    method: "post",
    data: {
      categoryName: optionSelected,
    },
    success: (response) => {
      if (response.status) {
        subCategory = response.subCategoryDetails;
        for (let i = 0; i < subCategory.length; i++) {
          $("#subcategory-selection").append(
            '<option value="' + subCategory[i].subCategory.SubCategoryName + '">' + subCategory[i].subCategory.SubCategoryName + "</option>"  
          );
        }
      }
    },
  });
});