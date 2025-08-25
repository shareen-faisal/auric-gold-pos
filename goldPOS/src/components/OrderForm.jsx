import React, { useState, useEffect, useMemo } from "react";
import styles from "../css/Form.module.css";
import axios from "axios";

const OrderForm = ({ userId }) => {
 
  const [selectedItemName, setSelectedItemName] = useState("");
  const [selectedStockTagNumber, setSelectedStockTagNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [makingPerGram, setMakingPerGram] = useState("");
  const [totalPrice, setTotalPrice] = useState('');

  const [orderTagNumber, setOrderTagNumber] = useState("");

  const [karat, setKarat] = useState("");
  const [pieces, setPieces] = useState("");
  const [waste, setWaste] = useState("");
  const [totalWeight, setTotalWeight] = useState("");
  const [totalMaking, setTotalMaking] = useState("");

  const [validationErrors, setValidationErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [customCategories, setCustomCategories] = useState([]);
  const [allStockItems, setAllStockItems] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [loadingStock, setLoadingStock] = useState(true);
  const [errorStock, setErrorStock] = useState(null);


  const filteredStockItems = useMemo(() => {
    if (!selectedItemName) return [];
   
    return allStockItems.filter(
      (item) => item.itemName === selectedItemName && item.quantity > 0
    );
  }, [allStockItems, selectedItemName]);

  const fetchNextOrderTag = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/orders/next-tag`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrderTagNumber(res.data.nextTagNumber);
    } catch (err) {
      console.error("Error fetching next order tag:", err);
    }
  };

  useEffect(() => {
    fetchNextOrderTag();
  }, [userId]);

  
  useEffect(() => {
    const fetchStock = async () => {
      try {
        setLoadingStock(true);
        setErrorStock(null);
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/stocks/getStocks`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAllStockItems(response.data.stocks);
      } catch (err) {
        console.error("Error fetching stock:", err);
        setErrorStock("Failed to fetch stock items. Please try again.");
      } finally {
        setLoadingStock(false);
      }
    };
    fetchStock();
  }, [userId]);


  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/categories/custom`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCustomCategories(res.data))
      .catch((err) => {
        console.error("Error fetching custom categories", err);
      });
  }, [userId]);


  useEffect(() => {
    const weight = parseFloat(totalWeight);
    const makingRate = parseFloat(makingPerGram);
    if (!isNaN(weight) && !isNaN(makingRate) && weight >= 0 && makingRate >= 0) {
      setTotalMaking((weight * makingRate).toFixed(2));
    } else {
      setTotalMaking("");
    }
  }, [totalWeight, makingPerGram]);

  useEffect(() => {
    const parsedItemPrice = parseFloat(itemPrice); 
    const parsedQuantity = parseFloat(quantity); 

    if (!isNaN(parsedItemPrice) && !isNaN(parsedQuantity) && parsedItemPrice >= 0 && parsedQuantity >= 0) {
      setTotalPrice((parsedItemPrice * parsedQuantity).toFixed(2));
    } else {
      setTotalPrice('');
    }
  }, [itemPrice, quantity]);

 
  useEffect(() => {
    if (isSuccess && message) {
      const timer = setTimeout(() => {
        setMessage("");
        setIsSuccess(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, message]);


  const handleItemNameChange = (e) => {
    const name = e.target.value;
    setSelectedItemName(name);
    setSelectedStockTagNumber("");
    setSelectedStock(null);
    setKarat("");
    setPieces("");
    setWaste("");
    setTotalWeight("");
    setTotalMaking("");
    setQuantity("");
    setItemPrice("");
    setMakingPerGram("");
    setTotalPrice('')
    setValidationErrors((prev) => ({
      ...prev,
      itemName: null,
      tagNumber: null,
    }));
  };

  const handleStockTagNumberChange = (e) => {
    const selectedTag = e.target.value;
    setSelectedStockTagNumber(selectedTag);
    setValidationErrors((prev) => ({ ...prev, tagNumber: null }));

    const stockItem = filteredStockItems.find(
      (item) => item.tagNumber === selectedTag
    );

    if (stockItem) {
      setSelectedStock(stockItem);
      setKarat(stockItem.karat);
      setPieces(stockItem.pieces);
      setWaste(stockItem.waste);
      setTotalWeight(stockItem.totalWeight);
      setQuantity(stockItem.quantity);
      setItemPrice(stockItem.itemPrice);
      setMakingPerGram(stockItem.makingPerGram);
    } else {
      setSelectedStock(null);
      setKarat("");
      setPieces("");
      setWaste("");
      setTotalWeight("");
      setTotalMaking("");
      setQuantity("");
      setItemPrice("");
      setMakingPerGram("");
    }
  };

  const handleEditableChange = (setter) => (e) => {
    setter(e.target.value);
    const { name } = e.target;
    setValidationErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
  };

 
  const validateForm = () => {
    const errors = {};
    if (!selectedItemName) errors.itemName = "Item Name is required.";
    if (!selectedStockTagNumber) errors.tagNumber = "Please select a Stock Tag Number.";
    if (!customerName) errors.customerName = "Customer Name is required.";
    if (customerName && customerName.length > 50) errors.customerName = "Customer Name should be less than 50 letters.";
    const parsedQuantity = parseInt(quantity, 10);
    if (!quantity || isNaN(parsedQuantity) || parsedQuantity < 1) {
      errors.quantity = "Quantity must be a positive integer.";
    } else if (selectedStock && parsedQuantity > selectedStock.quantity) {
      errors.quantity = `Quantity cannot exceed available stock (${selectedStock.quantity}).`;
    }
    if (!totalPrice || isNaN(totalPrice) || totalPrice < 1) errors.totalPrice = "Total Price must be greater than 0.";
    const parsedItemPrice = parseFloat(itemPrice);
    if (!itemPrice || isNaN(parsedItemPrice) || parsedItemPrice < 1) errors.itemPrice = "Item Price must be greater than 0.";
    const parsedMakingPerGram = parseFloat(makingPerGram);
    if (!makingPerGram || isNaN(parsedMakingPerGram) || parsedMakingPerGram < 1) errors.makingPerGram = "Making per Gram must be greater than 0.";
    const currentTotalMaking = parseFloat(totalMaking);
    if (!isNaN(parsedItemPrice) && !isNaN(currentTotalMaking) && parsedItemPrice <= currentTotalMaking) {
      errors.itemPrice = "Item Price must be greater than Total Making.";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

 
  const postOrder = async () => {
    setMessage("");
    setIsSuccess(false);
    if (!validateForm()) {
      setMessage("Please correct the errors in the form.");
      setIsSuccess(false);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/orders`,
        {
          tagNumber: orderTagNumber,
          stockTagNumber: selectedStockTagNumber,
          customerName,
          quantity: parseInt(quantity, 10),
          itemPrice: parseFloat(itemPrice),
          makingPerGram: parseFloat(makingPerGram),
          itemName: selectedStock.itemName,
          karat: selectedStock.karat,
          pieces: selectedStock.pieces,
          waste: selectedStock.waste,
          totalWeight: selectedStock.totalWeight,
          totalMaking: parseFloat(totalMaking),
          totalPrice: parseFloat(totalPrice)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 201) {
        setMessage("Order item submitted successfully!");
        setIsSuccess(true);
        setSelectedItemName("");
        setSelectedStockTagNumber("");
        setSelectedStock(null);
        setCustomerName("");
        setQuantity("");
        setItemPrice("");
        setMakingPerGram("");
        setKarat("");
        setPieces("");
        setWaste("");
        setTotalWeight("");
        setTotalMaking("");
        setTotalPrice('')
        setValidationErrors({});
      
        fetchNextOrderTag();
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      setIsSuccess(false);
      if (error.response) {
        setMessage(`Error: ${error.response.data.message}`);
      } else {
        setMessage("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div>
      {message && (
        <div className={isSuccess ? styles.successMessage : styles.errorMessage}>
          {message}
        </div>
      )}
      <div className={styles.inputRow}>
     
        <div className={styles.inputGroup}>
          <label htmlFor="orderTagNumber">Order Tag Number</label>
          <input
            type="text"
            id="orderTagNumber"
            name="orderTagNumber"
            value={orderTagNumber}
            readOnly
            className={styles.readOnlyInput}
          />
        </div>
       
        <div className={styles.inputGroup}>
          <label htmlFor="itemName">Item Name</label>
          <select
            id="itemName"
            name="itemName"
            value={selectedItemName}
            onChange={handleItemNameChange}
            className={validationErrors.itemName ? styles.inputError : ""}
          >
            <option value="">Select Item Name</option>
            {customCategories.map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))}
          </select>
          {validationErrors.itemName && (
            <span className={styles.errorText}>{validationErrors.itemName}</span>
          )}
        </div>
     
        <div className={styles.inputGroup}>
          <label htmlFor="stockTagNumber">Stock Tag Number</label>
          <select
            id="stockTagNumber"
            name="stockTagNumber"
            value={selectedStockTagNumber}
            onChange={handleStockTagNumberChange}
            disabled={!selectedItemName || loadingStock || filteredStockItems.length === 0}
            className={validationErrors.tagNumber ? styles.inputError : ""}
          >
            <option value="">Select Tag Number</option>
            {loadingStock ? (
              <option disabled>Loading tag numbers...</option>
            ) : filteredStockItems.length === 0 && selectedItemName ? (
              <option disabled>No stock found for this item name.</option>
            ) : (
              filteredStockItems.map((item) => (
                <option key={item.tagNumber} value={item.tagNumber}>
                  {item.tagNumber} ({item.quantity})
                </option>
              ))
            )}
          </select>
          {validationErrors.tagNumber && (
            <span className={styles.errorText}>{validationErrors.tagNumber}</span>
          )}
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="karat">Karat</label>
          <input
            type="number"
            id="karat"
            value={karat}
            readOnly
            className={styles.readOnlyInput}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="quantity">Quantity</label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            min="1"
            value={quantity}
            onChange={handleEditableChange(setQuantity)}
            className={validationErrors.quantity ? styles.inputError : ""}
            disabled={!selectedStock}
          />
          {validationErrors.quantity && (
            <span className={styles.errorText}>{validationErrors.quantity}</span>
          )}
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="pieces">Pieces</label>
          <input
            type="number"
            id="pieces"
            name="pieces"
            min="1"
            value={pieces}
            readOnly
            className={styles.readOnlyInput}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="itemPrice">Price Per Item (PKR)</label>
          <input
            type="number"
            id="itemPrice"
            name="itemPrice"
            min="1"
            value={itemPrice}
            onChange={handleEditableChange(setItemPrice)}
            className={validationErrors.itemPrice ? styles.inputError : ""}
            disabled={!selectedStock}
          />
          {validationErrors.itemPrice && (
            <span className={styles.errorText}>{validationErrors.itemPrice}</span>
          )}
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="totalPrice">Total Price (PKR)</label>
          <input
            type="number"
            id="totalPrice"
            name="totalPrice"
            min="1"
            value={totalPrice}
            readOnly
            className={styles.readOnlyInput}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="waste">Waste (grams)</label>
          <input
            type="number"
            id="waste"
            name="waste"
            min="0"
            value={waste}
            readOnly
            className={styles.readOnlyInput}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="totalWeight">Total Weight (grams)</label>
          <input
            type="number"
            id="totalWeight"
            name="totalWeight"
            min="1"
            value={totalWeight}
            readOnly
            className={styles.readOnlyInput}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="makingPerGram">Making / gram (PKR)</label>
          <input
            type="number"
            id="makingPerGram"
            name="makingPerGram"
            min="1"
            value={makingPerGram}
            onChange={handleEditableChange(setMakingPerGram)}
            className={validationErrors.makingPerGram ? styles.inputError : ""}
            disabled={!selectedStock}
          />
          {validationErrors.makingPerGram && (
            <span className={styles.errorText}>{validationErrors.makingPerGram}</span>
          )}
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="totalMaking">Total Making (PKR)</label>
          <input
            type="number"
            id="totalMaking"
            name="totalMaking"
            min="1"
            value={totalMaking}
            readOnly
            className={styles.readOnlyInput}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="customerName">Customer Name</label>
          <textarea
            id="customerName"
            name="customerName"
            value={customerName}
            onChange={handleEditableChange(setCustomerName)}
            rows={1}
            className={validationErrors.customerName ? styles.inputError : ""}
          />
          {validationErrors.customerName && (
            <span className={styles.errorText}>{validationErrors.customerName}</span>
          )}
        </div>
      </div>
      <div className={styles.buttonRow}>
        <button
          type="button"
          className={styles.submitButton}
          onClick={postOrder}
          disabled={loadingStock}
        >
          Submit Order
        </button>
      </div>
    </div>
  );
};
export default OrderForm;