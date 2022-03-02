import asyncHandler from 'express-async-handler';

import { Order } from 'models';
import { Request, Response } from 'types';

/**
 * @description Get all orders
 * @method GET /api/orders/all_orders
 * @access Private/Admin
 */
export const getAllOrders = asyncHandler(async (req: Request, res: Response) => {
    const orders = await Order.find();

    if (orders) {
        res.status(200).json(orders);
    } else {
        res.status(404);
        throw new Error('The orders is not existed');
    }
});

/**
 * @description Change order isDelivered base on that Order ID
 * @method PUT /api/orders/toggleIsDelivered
 * @access Private/Admin
 */
export const changeIsDeliveredStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const fetchedOrder = await Order.findById(id);

    if (fetchedOrder) {
        fetchedOrder.isDelivered = !fetchedOrder.isDelivered;
        fetchedOrder.deliveredAt = Date.now();

        const updatedOrder = await fetchedOrder.save();
        res.status(200).json(updatedOrder);
    } else {
        res.status(404);
        throw new Error(`This Order is not existed based on this ID : ${id}!`);
    }
});