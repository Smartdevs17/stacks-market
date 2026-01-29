export const truncateAddress = (address: string) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatPrice = (price: string) => {
  return `${price} STX`;
};
