import axios from "axios";


let shiprocketToken = null;

export const getShiprocketToken = async () => {
  if (shiprocketToken) return shiprocketToken;

  const response = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD,
    },
  );
  shiprocketToken = response.data.token;
  return shiprocketToken;
};

export const createShipment = async (order) => {
   const totalWeight=order.orderItems.reduce(
    (acc,item)=>acc+parseFloat(item.weight)*item.quantity
   )

  const weightKg = totalWeight / 1000;
  const token = await getShiprocketToken();
  console.log(order.shippingAddress)
 // console.log("SHIPMENT PAYLOAD:", payload);
  try {
   const response = await axios.post(
  "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
  {
    order_id: order._id,
    order_date: new Date().toISOString().split("T")[0],

    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION,

    shipping_is_billing: true,

    billing_customer_name: order.owner.fullname,
    billing_last_name: "Customer",

    billing_address: order.shippingAddress.address,
    billing_city: order.shippingAddress.city,
    billing_pincode: order.shippingAddress.postalCode,
    billing_state: "Uttar Pradesh",
    billing_country: "India",
    billing_phone: order.shippingAddress.phone,

    order_items: order.orderItems.map((item) => ({
      name: item.name,
      sku: item.itemId?.toString() || item.name,
      units: item.quantity,
      selling_price: item.price
    })),

    payment_method:
      order.paymentInfo.method === "COD" ? "COD" : "Prepaid",

    sub_total: order.totalPrice,

    length: 20,
    breadth: 15,
    height: 10,
    weight: weightKg || 0.5
  },
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);
  console.log("SHIPROCKET RESPONSE:", response.data);
  const shipmentId=response.data.shipment_id;
  console.log("SHIPROCKET RESPONSE:", response.data);

  const awbResponse=await axios.post(
    "https://apiv2.shiprocket.in/v1/external/courier/assign/awb",
    {
      shipment_id:shipmentId
    },
    {
        headers: {
          Authorization: `Bearer ${token}`
        }
    }
  )

  console.log("AWB RESPONSE:", awbResponse.data);

    return {
      shipmentId: shipmentId,
      awbCode: awbResponse.data.response.awb_code,
      courier: awbResponse.data.response.courier_name
    };
  } catch (error) {
    console.log("SHIPROCKET ERROR:");
  console.log(error.response?.data);

  throw error;
  }
};
