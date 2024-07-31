import {
  APPLY_COUPON_FAILED,
  APPLY_COUPON_REQUEST,
  APPLY_COUPON_SUCCESS,
  GET_DISCOUNT_FAILED,
  GET_DISCOUNT_REQUEST,
  GET_DISCOUNT_SUCCESS,
  GET_FILTER_COUPON_PRODUCT_FAILED,
  GET_FILTER_COUPON_PRODUCT_REQUEST,
  GET_FILTER_COUPON_PRODUCT_SUCCESS,
  TOTAL_DISCOUNT_TO_PRODUCT,
  UNAPPLY_COUPON_FAILED,
  UNAPPLY_COUPON_REQUEST,
  UNAPPLY_COUPON_SUCCESS,
} from "./types";

const initialState = {
  discounts: [],
  coupons: [],
  loading: false,
  error: null,
};

const handleError = (state, actionType, error) => {
  return {
    ...state,
    loading: false,
    error: error,
  };
};

const couponReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_FILTER_COUPON_PRODUCT_REQUEST:
    case APPLY_COUPON_REQUEST:
    case UNAPPLY_COUPON_REQUEST:
    case GET_DISCOUNT_REQUEST:
      return { ...state, loading: true };

    case GET_FILTER_COUPON_PRODUCT_SUCCESS:
      const { carts, coupon } = action.payload;
      const { coupons } = state;

      // Tạo một bộ ID sản phẩm từ giỏ hàng hiện tại
      const cartProductIDs = new Set(
        carts.map((cartItem) => cartItem.productID)
      );
      // console.log(cartProductIDs)

      // Lọc phiếu giảm giá cho các sản phẩm không có trong giỏ hàng hiện tại
      const updatedCoupons = coupons.filter((existingCoupon) =>
        cartProductIDs.has(existingCoupon.product._id)
      );
      // console.log(updatedCoupons)

      // Thêm phiếu giảm giá mới cho sản phẩm trong giỏ hàng hiện tại
      for (const cartItem of carts) {
        const foundCoupon = coupon?.find(
          (huydev) => huydev.product._id === cartItem.productID
        );

        if (
          foundCoupon &&
          !updatedCoupons.some(
            (existingCoupon) => existingCoupon.code === foundCoupon.code
          )
        ) {
          updatedCoupons.push(foundCoupon);
        }
      }

      return {
        ...state,
        coupons: updatedCoupons,
      };

    case GET_DISCOUNT_SUCCESS:
      return {
        ...state,
        discounts: action.payload,
      };

    case TOTAL_DISCOUNT_TO_PRODUCT:
      return {
        ...state,
        totalDiscout: action.payload,
      };

    case APPLY_COUPON_SUCCESS:
      return {
        ...state,
        discounts: [...state.discounts, action.payload],
      };
    case UNAPPLY_COUPON_SUCCESS:
      return {
        ...state,
        discounts: state.discounts.filter(
          (e) => e.coupon._id !== action.payload
        ),
      };
    case GET_FILTER_COUPON_PRODUCT_FAILED:
    case GET_DISCOUNT_FAILED:
    case APPLY_COUPON_FAILED:
    case UNAPPLY_COUPON_FAILED:
      return handleError(state, action.type, action.payload);

    default:
      return initialState;
  }
};

export default couponReducer;
