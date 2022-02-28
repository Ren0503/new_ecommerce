import asyncHandler from 'express-async-handler';
import { Request, Response } from '../types';

import { Product } from '../models';

/**
 * @description Fetch all products
 * @method GET /api/products
 * @access Public
 */
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
	//TODO: Pagination Size 
	const pageSize = 12;
	const page = Number(req.query.pageNumber) || 1;

	//TODO: search function for search bar
	const keyword = req.query.keyword ? {
		name: {
			$regex: req.query.keyword,
			$options: 'i'
		}
	} : {};

	const count = await Product.countDocuments({ ...keyword });
	const products = await Product.find({ ...keyword }).select({
		"rating": 1,
		"numReviews": 1,
		"price": 1,
		"_id": 1,
		"name": 1,
		"image": 1,
		"category": 1,
		"brand": 1,
		"onSale": 1
	}).limit(pageSize).skip(pageSize * (page - 1));

	res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

/**
 * @description Fetch single product
 * @route GET /api/products/:id
 * @access Public
 */
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params as { id: string };
	const product = await Product.findById(id);

	if (product) res.json(product);
	else {
		res.status(404);
		throw new Error('Product not found.');
	}
});

export const getSomeReview = asyncHandler(async (req: Request, res: Response) => {
	const pageSize = 5;
	const page = Number(req.query.pageReviewNumber) || 1

	const currentNumOfReviews = await Product.findById(req.params.id).select('numReviews');

	if (currentNumOfReviews) {
		await Product.findOne({ _id: req.params.id }).select('reviews').then(function (myDoc) {
			if (myDoc) {
				const setOfReviews = myDoc.reviews.slice((page - 1) * pageSize, (page) * pageSize);
				res.json({ setOfReviews, page, pages: Math.ceil(currentNumOfReviews.numReviews / pageSize) });
			}
		});
	} else {
		throw new Error('Product not have reviews');
	}
});

/**
 * @description Delete a product
 * @route DELETE /api/products/:id
 * @access Private/Admin
 */
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params as { id: string };
	const product = await Product.findById(id);
	if (product) {
		await product.remove();
		res.json({ message: 'Product Removed' });
	} else {
		res.status(404);
		throw new Error('Product not found.');
	}
});

/**
 * @description Create a product
 * @route POST /api/products/
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
		youtube: 'youtubelink',
		details: { exist: true },
		tvsDetail: { exist: true },
		phoneDetail: { exist: true },
		headphoneDetail: { exist: true },
		gameDetail: { exist: true },
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
	const createdProduct = await product.save();
	res.status(201).json(createdProduct);
});

/**
 * @description Update a product
 * @route PUT /api/products/:id
 * @access Private/Admin
 */
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params as { id: string };
	const product = await Product.findById(id);

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
		throw new Error('Product not found.');
	}
});

/**
 * @description Create new review
 * @route POST /api/products/:id/reviews
 * @access Private
 */
export const createProductReview = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params as { id: string };
	const { rating, comment, productId } = req.body as {
		rating: number;
		comment: string;
		productId: string;
	};

	const product = await Product.findById(id);
	if (!req.user) {
		res.status(400);
		throw new Error('User not found');
	}
	if (product) {
		const alreadyReviewed = product.reviews.find(
			(r) => r.user.toString() === req.user!._id.toString()
		);
		if (alreadyReviewed) {
			res.status(400);
			throw new Error('Product already reviewed');
		}
		const review = {
			name: req.user.name,
			rating,
			comment,
			user: req.user._id
		};
		product.reviews.push(review);
		product.numReviews = product.reviews.length;
		product.rating =
			product.reviews.reduce((acc, item) => item.rating + acc, 0) /
			product.reviews.length;

		switch (Number(rating)) {
			case 1:
				product.numOf1StarsReviews = product.numOf1StarsReviews + 1;
				await product.save();

				break;
			case 2:
				product.numOf2StarsReviews = product.numOf2StarsReviews + 1;
				await product.save();

				break;
			case 3:
				product.numOf3StarsReviews = product.numOf3StarsReviews + 1;
				await product.save();

				break;
			case 4:
				product.numOf4StarsReviews = product.numOf4StarsReviews + 1;
				await product.save();

				break;
			case 5:
				product.numOf5StarsReviews = product.numOf5StarsReviews + 1;
				await product.save();

				break;
			default:
				break;
		}

		await product.save();
		res.status(201).json({ message: 'Review Added' });
	} else {
		res.status(404);
		throw new Error('Product not found.');
	}
});

/**
 * @description Get top rated products
 * @route GET /api/products/top
 * @access Public
 */
export const getTopProducts = asyncHandler(
	async (req: Request, res: Response) => {
		const products = await Product.find({}).sort({ rating: -1 }).limit(3);
		res.json(products);
	}
);
