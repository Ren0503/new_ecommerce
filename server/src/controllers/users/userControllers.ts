import asyncHandler from 'express-async-handler';

import { User } from '../../models';
import { Request, Response } from '../../types';
import { generateToken } from '../../utils';

/**
 * @description Authenticate user & get token
 * @method POST /api/users/login
 * @access Public
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body as { email: string; password: string };
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            wishList: user.wishList,
            cartList: user.cartList,
            likeAndDislike: user.likeAndDislike,
            token: generateToken(user._id)
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

/**
 * @description Take user current details in database
 * @method GET /api/users/current_status
 * @access Private
 */
export const getCurrentUserStatus = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.user?._id);

    if (user) {
        res.status(200).json({
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            wishList: user.wishList,
            cartList: user.cartList,
            likeAndDislike: user.likeAndDislike,
        });
    } else {
        res.status(404);
        throw new Error("Can't find the user");
    }
})

/**
 * @description Get user profile
 * @method GET /api/users/profile
 * @access Private
 */
export const getUserProfile = asyncHandler(
    async (req: Request, res: Response) => {
        const user = await User.findById(req.user?._id);
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    }
);

/**
 * @description Register a new user
 * @method POST /api/users/
 * @access Public
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body as {
        name: string;
        email: string;
        password: string;
    };
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email,
        password
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id)
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

/**
 * @description Update user profile
 * @method PUT /api/users/profile
 * @access Private
 */
export const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.user?._id);

    if (user) {
        const { name, email, password } = req.body as {
            name?: string;
            email?: string;
            password?: string;
        };

        user.name = name ? name : user.name;
        user.email = email ? email : user.email;

        if (password) user.password = password;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            token: generateToken(updatedUser._id)
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

/**
 * @description Get users wishlist base on there ID
 * @method GET /api/users/wishlist
 * @access Private
 */
export const getWishListItems = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.user?._id);

    if (user) {
        const theWishList = [...user.wishList];
        res.status(200).json(theWishList);
    } else {
        res.status(404);
        throw new Error('User is not existed');
    }
});

/**
 * @description Add an item to the wishlist
 * @method POST /api/users/wishlist/add_item
 * @access Private
 */
export const addItemToUserWishList = asyncHandler(async (req: Request, res: Response) => {
    const {
        itemId,
        productName,
        productPrice,
        productImage,
        productRating,
        productNumReviews,
        onSales
    } = req.body as {
        itemId: string
        productName: string
        productPrice: number
        productImage: string
        productRating: number
        productNumReviews: number
        onSales: number
    }

    const user = await User.findById(req.user?._id);

    const theItem = {
        itemId,
        productName,
        productPrice,
        productImage,
        productRating,
        productNumReviews,
        onSales
    }

    if (user) {
        user.wishList.push(theItem);
        const newUser = await user.save();

        res.status(200).json(newUser);
    } else {
        res.status(404);
        throw new Error('User not found.');
    }
});

/**
 * @description Delete an item from the wishlist
 * @method DELETE /api/users/wishlist/delete_item/:id
 * @access Private
 */
export const deleteItemFromWishlist = asyncHandler(async (req: Request, res: Response) => {
    const wishListItemId = req.params.id;
    const user = await User.findById(req.user?._id);

    if (user) {
        let deleteIndex;
        for (let i = 0; i < user.wishList.length; i++) {
            if (user.wishList[i]._id == wishListItemId) {
                deleteIndex = i;
                break;
            }
        }

        if (deleteIndex == undefined) {
            res.status(404);
            throw new Error("Can't find the item that you want to delete base on this wishListItemId");
        }

        user.wishList.splice(deleteIndex, 1);
        await user.save();

        res.status(200).json("Delete the item from wishList successfully");
    } else {
        res.status(404);
        throw new Error('User not found.');
    }
});

/**
 * @description Delete all items from the wishlist
 * @method DELETe /api/users/wishlist/delete_item
 * @access Private
 */
export const deleteAllItemFromWishlist = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.user?._id);

    if (user) {
        user.wishList = [];
        await user.save();

        res.status(200).json("Clear all items in the wish list successfully");
    } else {
        res.status(404);
        throw new Error("Can't find the user that you are looking for");
    }
});

/**
 * @description Add an item to the cart
 * @method POST /api/users/cart/add_item
 * @access Private
 */
export const addItemToCart = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.user?._id);
    const { 
        itemId, 
        productName, 
        productImage, 
        productPrice, 
        onSales, 
        countInStock, 
        quantity 
    } = req.body as {
        itemId: string
        productName: string
        productImage: string
        productPrice: number
        onSales: number
        countInStock: number
        quantity: number
    }
    
    if (user) {
        const item = {
            itemId,
            productName, 
            productImage, 
            productPrice, 
            onSales,
            countInStock, 
            quantity
        }

        const existedItem = user.cartList.find(x => x.itemId === item.itemId);
        if (existedItem) {
            res.status(400);
            throw new Error("This item is already in the cart");
        }

        console.log(user.cartList);

        user.cartList.push({
            itemId,
            productName, 
            productImage, 
            productPrice, 
            onSales,
            countInStock, 
            quantity
        });

        const savedUser = await user.save();
        res.status(200).json(savedUser);
    } else {
        res.status(404);
        throw new Error('Cant find the user')
    }
});

/**
 * @description Remove an item from the cart
 * @method DELETE /api/users/cart/remove_item/:id
 * @access Private
 */
export const removeItemFromCart = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.user?._id);
    const cartItemId = req.params.id as string;

    if (user) {
        let deletedIndex;
        for (let i = 0; i < user.cartList.length; i++) {
            if (user.cartList[i].itemId == cartItemId) {
                deletedIndex = i;
                break;
            }
        }

        if (deletedIndex === undefined) {
            res.status(404);
            throw new Error("Can't find the item in the cart with this Id, please try again");
        }

        user.cartList.splice(deletedIndex, 1);
        await user.save();

        res.status(200).json('Delete item from cartList successfully');
    } else {
        res.status(404);
        throw new Error('User is not existed');
    }
});

/**
 * @description Get all items from the cart
 * @method GET /api/users/cart
 * @access Private
 */
export const getUserCartList = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findById(req.user?._id);

    if (user) {
        res.status(200).json(user.cartList);
    } else {
        res.status(404);
        throw new Error("Can't find user with this ID");
    }
});

/**
 * @description Get a user based on the given token
 * @method GET /api/resetPassword/:resetPasswordToken
 * @access Public
 */
export const matchEmailByToken = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.resetPasswordToken
    });

    if (user) {
        res.status(200).send({
            email: user.email,
            message: 'password reset link a-ok'
        });
    } else {
        res.json('Link have expired!');
    }
});

/**
 * @description Post change the password of the current user
 * @method POST /api/resetPassword/updatePasswordByEmail
 * @access Public
 */
export const updatePasswordByEmail = asyncHandler(async (req: Request, res: Response) => {
    const user = await User.findOne({
        email: req.body.email
    });

    if (user) {
        user.password = req.body.password;
        // Hashing function is in model file
        await user.save();

        res.status(200).send({
            message: 'password updated'
        });

    } else {
        res.status(404);
        throw new Error('This user is not existed');
    }
});