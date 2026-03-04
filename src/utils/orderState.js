export const allowedTransitions = {
  placed: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: []
};

export const canCancelOrder = (status) => {
  return ["placed", "confirmed", "packed"].includes(status);
};