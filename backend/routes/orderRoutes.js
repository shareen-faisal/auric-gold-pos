const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const authenticateUser = require('../middleware/auth');
const Stock = require('../models/Stock'); 


router.get('/next-tag', authenticateUser, async (req, res) => {
  try {
    //const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    const lastOrder = await Order.findOne({ userId: req.userId }).sort({ createdAt: -1 });

    let nextTagNumber = "OR_TAG001";

    if (lastOrder && lastOrder.tagNumber) {
      const lastNumber = parseInt(lastOrder.tagNumber.replace("OR_TAG", "")) || 0;
      const newNumber = lastNumber + 1;
      nextTagNumber = `OR_TAG${String(newNumber).padStart(3, '0')}`;
    }

    res.json({ nextTagNumber });
  } catch (err) {
    console.error("Error generating next tag:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', authenticateUser, async (req, res) => {
  try {
    const {
      itemName,
      karat,
      quantity,
      pieces,
      waste,
      totalWeight,
      itemPrice,
      makingPerGram,
      totalMaking,
      customerName,
      tagNumber,
      stockTagNumber,
      totalPrice
    } = req.body;

    const stockItem = await Stock.findOne({ userId: req.userId, tagNumber: stockTagNumber });

    if (!stockItem) {
      return res.status(400).json({ message: `Stock item with tag number "${stockTagNumber}" not found.` });
    }
    if (stockItem.quantity < quantity) {
      return res.status(400).json({ message: `Insufficient stock for item "${stockItem.itemName}". Available: ${stockItem.quantity}, Requested: ${quantity}.` });
    }

    const updatedStock = await Stock.findOneAndUpdate(
      { userId: req.userId, tagNumber: stockTagNumber },
      { $inc: { quantity: -quantity } },
      { new: true }
    );

    if (!updatedStock) {
      return res.status(500).json({ message: 'Failed to update stock.' });
    }

    if (updatedStock.quantity <= 0) {
      updatedStock.status = "Out of Stock";
      await updatedStock.save(); 
  } else {
      if (updatedStock.status === "Out of Stock") {
          updatedStock.status = "In Stock";
          await updatedStock.save();
      }
  }

    
    const newOrder = new Order({
      userId: req.userId,
      itemName,
      tagNumber,
      stockTagNumber, 
      karat,
      quantity,
      pieces,
      waste,
      totalWeight,
      itemPrice,
      makingPerGram,
      totalMaking,
      customerName,
      totalPrice
    });

    await newOrder.save();

    res.status(201).json({ message: 'Order created successfully', order: newOrder });

  } catch (err) {
    console.error("Error posting order:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/getOrders', authenticateUser , async (req,res)=>{
  try {
    const userId = req.userId;

    const orders = await Order.find({ userId: userId }).sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: 'Server error' });
  }
})

router.put('/:orderId', authenticateUser, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.userId; 
    const {
      itemName,
      customerName,
      karat,
      quantity,
      pieces,
      waste,
      totalWeight,
      itemPrice,
      makingPerGram,
      totalMaking,
      status,
      totalPrice,
      stockTagNumber, 
    } = req.body;

    
    const existingOrder = await Order.findOne({ _id: orderId, userId: userId });
    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found or you do not have permission to access it.' });
    }

    const previousQuantity = existingOrder.quantity;
    const newQuantity = quantity;
    const stockId = existingOrder.stockTagNumber;

   
    const stockItem = await Stock.findOne({ tagNumber: stockId, userId: userId });

    if (!stockItem) {
      return res.status(404).json({ message: 'Associated stock item not found for this user.' });
    }

   
    if (newQuantity < previousQuantity) {
      
      const quantityIncrease = previousQuantity - newQuantity;
      stockItem.quantity += quantityIncrease;
    } else if (newQuantity > previousQuantity) {
     
      const quantityDecrease = newQuantity - previousQuantity;
      if (stockItem.quantity < quantityDecrease) {
        return res.status(400).json({
          message: `Insufficient stock to fulfill the updated order. Available: ${stockItem.quantity}, Needed: ${quantityDecrease}.`
        });
      }
      stockItem.quantity -= quantityDecrease;
    }

    if (stockItem.quantity <= 0) {
      stockItem.status = "Out of Stock"; 
    } else {
      if (stockItem.status === "Out of Stock") {
        stockItem.status = "In Stock"; 
      }
    }

    await stockItem.save();

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId, {
        itemName,
        customerName,
        karat,
        quantity,
        pieces,
        waste,
        totalWeight,
        itemPrice,
        makingPerGram,
        totalMaking,
        status,
        totalPrice
      }, {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json(updatedOrder);

  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
