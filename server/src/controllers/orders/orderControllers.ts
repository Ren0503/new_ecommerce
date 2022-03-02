import asyncHandler from 'express-async-handler';

import { Order, User } from '../../models';
import { Request, Response } from '../../types';

/**
 * @description Create an order
 * @method POST /api/orders
 * @access Private
 */
export const addOrder = asyncHandler(async (req: Request, res: Response) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        onSale } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(404);
        throw new Error('No order items');
    } else {
        const order = new Order({
            orderItems,
            user: req.user?._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            onSale
        });

        const currentUser = await User.findById(req.user?._id);
        if (currentUser) {
            currentUser.cartList = [];

            await currentUser.save();
            const createdOrder = await order.save();
            res.status(201).json(createdOrder);
        } else {
            res.status(404);
            throw new Error('Not found user');
        }
    }
});

/**
 * @description Get an order by ID
 * @method GET /api/orders/:id
 * @access Private
 */
export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const fetchedOrder = await Order.findById(id).populate('user', 'name email');

    if (fetchedOrder) {
        res.status(200).json(fetchedOrder);
    } else {
        res.status(404);
        throw new Error('Not found order');
    }
});

/**
 * @description Update order isPaid to true
 * @method PUT /api/orders/:id
 * @access Private
 */
export const updateOrderIsPaidStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const fetchedOrder = await Order.findById(id);

    if (fetchedOrder) {
        fetchedOrder.isPaid = true;
        fetchedOrder.paidAt = Date.now();
        fetchedOrder.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.payer.email_address
        }

        const updatedOrder = await fetchedOrder.save(); 

        res.status(200).json(updatedOrder);
    } else {    
        res.status(404);
        throw new Error('Can\'t find the Order, please try again');
    }
});

/**
 * @description Get orders base on userId
 * @method GET /api/orders/my_orders
 * @access Private 
 */
export const getOrdersByUserId = asyncHandler(async (req: Request, res: Response) => {
    const orders = await Order.find({
        user: req.user?._id
    });
    res.json(orders);
});