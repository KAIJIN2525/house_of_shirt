import React, { useEffect, useState } from "react";
import ProductManagement from "./Product/ProductManagement";
import { fetchAdminProducts } from "../../redux/slices/adminProductSlice";
import { useDispatch, useSelector } from "react-redux";
import { LuDollarSign, LuPackage, LuShoppingBag, LuTags, LuTrendingUp,  } from "react-icons/lu";
import { FaPlusCircle } from "react-icons/fa";
import { FiAlertTriangle } from "react-icons/fi";
import Loader from "../Common/Loader";
import CreateProduct from "./Product/CreateProduct";
import CategoriesTag from "./Product/CategoriesTag";

const tabs = [
  { id: "create", label: "Create Products", icon: FaPlusCircle },
  { id: "products", label: "Products", icon: LuShoppingBag },
  { id: "tags", label: "Tags", icon: LuTags },
];

const Product = () => {
  const [activeTab, setActiveTab] = useState("products");


  const dispatch = useDispatch();
  const {
    products,
    loading: productsLoading,
    error: productsError,
  } = useSelector((state) => state.adminProducts);

  useEffect(() => {
    dispatch(fetchAdminProducts());
  }, [dispatch]);

  return (
    <div className="flex-1 overflow-auto relative z-10">
      {/* <Header title="Products" /> */}
      <h2 className="text-2xl font-bold mb-6">Product Management</h2>

      <main className="mx-auto py-6 px-2 lg:px-8">
        {/* STATS */}
        {/* <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard
            name="Total Products"
            icon={LuPackage}
            value={products.length}
            color="#6366F1"
          />
          <StatCard
            name="Top Selling"
            icon={LuTrendingUp}
            value={"10"}
            color="#10B981"
          />
          <StatCard
            name="Low Stock"
            icon={FiAlertTriangle}
            value={"20"}
            color="#F59E0B"
          />
          <StatCard
            name="Total Revenue"
            icon={LuDollarSign}
            value={"₦543,210"}
            color="#EF4444"
          />
        </motion.div> */}

        <div className="flex justify-center sm:justify-start mb-2 ">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 mx-2 rounded-md transition-colors duration-200 
                      ${
                        activeTab === tab.id
                          ? "bg-gray-200 text-gray-800"
                          : "bg-gray-100 text-gray-600"
                      }
                      `}
            >
              <tab.icon className="mr-2 size-5" />
              <span className="text-sm sm:text-base">{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === "create" && <CreateProduct setActiveTab={setActiveTab} />}
        {activeTab === "products" && <ProductManagement />}
        {activeTab === "tags" && <CategoriesTag />}

        {/* CHARTS
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SalesTrendChart />
                <CategoryDistributionChart />
              </div> */}
      </main>
    </div>
  );
};

export default Product;
