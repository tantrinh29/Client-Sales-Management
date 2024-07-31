export const formatPrice = (price) => {
  return parseInt(price).toLocaleString();
};

export const calculateDiscountPercentage = (initialPrice, priceHasDropped) => {
  if (initialPrice === 0) {
    return 0; // Tránh chia cho 0
  }

  const discountPercentage =
    ((initialPrice - priceHasDropped) / initialPrice) * 100;
  return `${discountPercentage.toFixed(0)}%`;
};
