import asyncHandler from 'express-async-handler';

import { Product, User } from '../../models';
import { Request, Response } from '../../types';

/**
 * @description Fetch all products
 * @method GET /api/products
 * @access Public
 */
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
    //TODO: Pagination Size 
    const pageSize = 10;
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

/**
 * @description Get some reviews out of a product based on the product Id
 * @method GET /api/products/get_reviews/:id?pageReviewNumber=1
 * @access Public
 */
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
 * @description Delete a review of a product based on UserID and ProductID and ReviewID
 * @method DELETE /api/products/delete_review
 * @access Private
 */
export const deleteReviewProduct = asyncHandler(async (req: Request, res: Response) => {
    const { reviewId, productId } = req.params;
    const chosenProduct = await Product.findById(productId);

    if (chosenProduct) {
        //TODO: FIND THE POSITION OF THE DELETED REVIEWS AND DELETE THE REVIEW
        let deletedReviewIndex;
        for (let i = 0; i < chosenProduct.reviews.length; i++) {
            if (reviewId == chosenProduct.reviews[i]._id) {
                deletedReviewIndex = i;
                break;
            }
        }

        if (deletedReviewIndex !== undefined) {
            switch (chosenProduct.reviews[deletedReviewIndex].rating) {
                case 1:
                    chosenProduct.numOf1StarsReviews = chosenProduct.numOf1StarsReviews - 1;
                    chosenProduct.reviews.splice(deletedReviewIndex, 1);
                    chosenProduct.rating = chosenProduct.reviews.reduce((acc, cur) => cur.rating + acc, 0) / chosenProduct.numReviews;
                    chosenProduct.numReviews = chosenProduct.numReviews - 1;
                    await chosenProduct.save();

                    break;
                case 2:
                    chosenProduct.numOf2StarsReviews = chosenProduct.numOf2StarsReviews - 1;
                    chosenProduct.reviews.splice(deletedReviewIndex, 1);
                    chosenProduct.rating = chosenProduct.reviews.reduce((acc, cur) => cur.rating + acc, 0) / chosenProduct.numReviews;
                    chosenProduct.numReviews = chosenProduct.numReviews - 1;
                    await chosenProduct.save();

                    break;
                case 3:
                    chosenProduct.numOf3StarsReviews = chosenProduct.numOf3StarsReviews - 1;
                    chosenProduct.reviews.splice(deletedReviewIndex, 1);
                    chosenProduct.rating = chosenProduct.reviews.reduce((acc, cur) => cur.rating + acc, 0) / chosenProduct.numReviews;
                    chosenProduct.numReviews = chosenProduct.numReviews - 1;
                    await chosenProduct.save();

                    break;
                case 4:
                    chosenProduct.numOf4StarsReviews = chosenProduct.numOf4StarsReviews - 1;
                    chosenProduct.reviews.splice(deletedReviewIndex, 1);
                    chosenProduct.rating = chosenProduct.reviews.reduce((acc, cur) => cur.rating + acc, 0) / chosenProduct.numReviews;
                    chosenProduct.numReviews = chosenProduct.numReviews - 1;
                    await chosenProduct.save();

                    break;
                case 5:
                    chosenProduct.numOf5StarsReviews = chosenProduct.numOf5StarsReviews - 1;
                    chosenProduct.reviews.splice(deletedReviewIndex, 1);
                    chosenProduct.rating = chosenProduct.reviews.reduce((acc, cur) => cur.rating + acc, 0) / chosenProduct.numReviews;
                    chosenProduct.numReviews = chosenProduct.numReviews - 1;
                    await chosenProduct.save();

                    break;
                default:
                    return;
            }

            res.status(200).json('Review has been deleted');
        } else {
            res.status(404);
            throw new Error("Can't find the review based on reviewID thus no review is deleted");
        }

    } else {
        res.status(404);
        throw new Error("Can't find the product you want to delete review from");
    }
});

export const stickReviewLike = asyncHandler(async (req: Request, res: Response) => {
    const { productId, reviewId } = req.body;
    const product = await Product.findById(productId);
    const user = await User.findById(req.user?._id);

    if (product) {
        for (let i = 0; i < req.user?.likeAndDislike.length; i++) {
            if (reviewId == req.user.agreeAndDisAgree[i].reviewId) {
                res.status(400);
                res.send("User have already choosen and this process can't be reversed");
            }
        }

        let currentReviewIndex;
        for (let i = 0; i < product.reviews.length; i++) {
            if (product.reviews[i]._id == reviewId) {
                currentReviewIndex = i;
            }
        }

        product.reviews[currentReviewIndex].agree.push({
            userId: req.user._id
        });
        product.reviews[currentReviewIndex].numOfAgrees = product.reviews[currentReviewIndex].numOfAgrees + 1;


        user.agreeAndDisAgree.push({
            productId: productId,
            reviewId: reviewId,
            agree: true
        });

        await product.save();
        await user.save();

        res.status(200);
        res.send('Adding new numOfAgreees and agreeArray into that new review adding a new item into agreeorDisAgree array of user');
    } else {
        res.status(404);
        throw new Error("Can't find the product that you are looking for");
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
