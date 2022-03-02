import express from 'express';
import { protect, admin } from '../middleware';
import {
    addOrder,
    getOrderById,
    updateOrderIsPaidStatus,
    getOrdersByUserId,
    
    getAllOrders,
    changeIsDeliveredStatus,
} from '../controllers/orders';

const router = express.Router();

router
    .route('/all_orders')
    .get(protect, admin, getAllOrders)

router
    .route('/my_orders')
    .get(protect, getOrdersByUserId)

router
    .route('/:id/delivery')
    .put(protect, admin, changeIsDeliveredStatus)

router
    .route('/:id')
    .get(protect, getOrderById)

router
    .route('/:id/pay')
    .put(protect, updateOrderIsPaidStatus)

router
    .route('/')
    .post(protect, addOrder);

export default router;