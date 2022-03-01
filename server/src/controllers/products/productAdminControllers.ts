import asyncHandler from 'express-async-handler';

import { Product } from '../../models';
import { Request, Response } from '../../types';

/**
 * @description Create a product
 * @method POST /api/products
 * @access Private/Admin
 */
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
    const product = new Product({
        user: req.user?._id,
        name: 'Sample Name',
        image: '/images/sample.jpg',
        subImages: [],
        brand: 'sample brand',
        category: 'Text',
        description: 'text',
        details: { exist: true },
        rating: 0,
        price: 0,
        onSale: 0,
        newProduct: false,
        preOrder: false,
        countInStock: 0,
        numReviews: 0,
        numOf5StarsReviews: 0,
        numOf4StarsReviews: 0,
        numOf3StarsReviews: 0,
        numOf2StarsReviews: 0,
        numOf1StarsReviews: 0,
    });

    await product.save();
    res.status(201).send(product);
});

/**
 * @description Delete a product base on it's ID
 * @method DELETE /api/products/:id
 * @access Private/Admin
 */
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('The Product Is Not Existed');
    }

    await product.remove();
    res.status(200).json('Delete product successfully');
});

/**
 * @description Update a product
 * @method PUT /api/products/:id
 * @access Private/Admin
 */
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = req.body.name || product.name;
        product.price = req.body.price || product.price;
        product.onSale = req.body.onSale;
        product.image = req.body.image || product.image;
        product.brand = req.body.brand || product.brand;
        product.category = req.body.category || product.category;
        product.countInStock = req.body.countInStock || product.countInStock;
        product.numReviews = req.body.numReviews || product.numReviews;
        product.description = req.body.description || product.description;
        product.newProduct = req.body.newProduct;
        product.preOrder = req.body.preOrder;

        if (req.body.details !== undefined) {
            product.details = req.body.details || product.details;
        }

        const updatedProduct = await product.save();
        res.status(201).send(updatedProduct);
    } else {
        res.status(404);
        throw new Error('This product is not existed');
    }
});

/**
 * @description Delete sub image of products
 * @method POST /api/products/deleteSubImage/:productId?imageIndex=
 * @access Private/Admin
 */
export const deleteSubImage = asyncHandler(async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.productId);

    if (product) {
        const { imageIndex } = req.query as unknown as { imageIndex: number }
        product.subImages.splice(imageIndex);
        await product.save();

        res.status(200).send('Delete Sub-image successfully');
    } else {
        res.status(404).send('Cant find product based on ID');
    }
});