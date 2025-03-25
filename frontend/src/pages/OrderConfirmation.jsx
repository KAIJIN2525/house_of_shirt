import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCart } from "../redux/slices/cartSlice";

const OrderConfirmation = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { checkout } = useSelector((state) => state.checkout);
  
    console.log("Checkout State:", checkout); // Debug: Check the checkout state

    const formatPrice = (price) => {
      return new Intl.NumberFormat('en-US').format(price);
    };
  
  

    // Clear cart when order is confirmed
    useEffect(() => {
      if (checkout && checkout._id) {
        dispatch(clearCart());
        localStorage.removeItem("cart");
      } else {
        navigate("/my-orders");
      }
    }, [checkout, dispatch]);
  
    const calculateEstimatedDelivery = (createdAt) => {
      const orderDate = new Date(createdAt);
      orderDate.setDate(orderDate.getDate() + 10); // Add 10 days to the order date
      return orderDate.toLocaleDateString();
    };
  
    // Add checks to ensure checkout and checkout.orderItems are defined
    if (!checkout) {
      return <p>Loading checkout details...</p>;
    }
  
    if (!checkout.orderItems) {
      return <p>No items in the checkout.</p>;
    }
  
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white">
        <h1 className="text-xl sm:text-4xl  font-bold text-center text-emerald-700 mb-8">
          Thank you for your Order!
        </h1>
  
        {checkout && checkout.orderItems && (
          <div className="p-6 rounded-lg shadow-md border border-gray-200">
            {/* Render order details */}
            <div className="flex justify-between mb-20">
              <div>
                <h2 className="text-md sm:text-xl font-semibold">
                  Order ID: {checkout._id}
                </h2>
                <p className="text-sm sm:text-base text-gray-500">
                  Date: {new Date(checkout.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-emerald-700 text-xs sm:text-sm">
                  Estimated Delivery:{" "}
                  {calculateEstimatedDelivery(checkout.createdAt)}
                </p>
              </div>
            </div>
            {/* Render order items */}
            <div className="mb-20">
              {checkout.orderItems.map((item) => ( // <-- Use orderItems instead of checkoutItems
                <div key={item.productId} className="flex items-center mb-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="size-16 rounded-md object-cover mr-4"
                  />
                  <div>
                    <h4 className="text-md font-semibold">{item.name}</h4>
                    <p className="text-sm text-gray-500">
                      {item.color} | {item.size}
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-md">₦{formatPrice(item.price)}</p>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* Render payment and delivery info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-lg font-semi-bold mb-2">Payment</h4>
                <p className="text-gray-600">{checkout.paymentMethod}</p>
              </div>
              <div>
                <h4 className="text-lg font-semi-bold mb-2">Delivery</h4>
                <p className="text-gray-600">
                  {checkout.shippingAddress.address}
                </p>
                <p className="text-gray-600">
                  {checkout.shippingAddress.city},{" "}
                  {checkout.shippingAddress.country}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default OrderConfirmation;