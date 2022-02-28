import asyncHandler from 'express-async-handler';

import { User } from '../models';
import { Request, Response } from '../types';
import { generateToken } from '../utils';

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
        res.status(200).send({
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
 * @description Get all users
 * @method GET /api/users/
 * @access Private/Admin
 */
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
    const totalPageSize = 10;
    const currentPage = Number(req.query.pageNumber) || 1;

    const count = await User.countDocuments();

    const users = await User.find().select({
        "_id": 1,
        "name": 1,
        "email": 1,
        "isAdmin": 1
    }).limit(totalPageSize).skip((currentPage - 1) * totalPageSize);

    if (!users) {
        res.status(400);
        throw new Error("There are no users in the databases");
    }

    res.status(200).send({ page: currentPage, pages: Math.ceil(count / totalPageSize), users });
});

/**
 * @description Delete a user
 * @method DELETE /api/users/:id
 * @access Private/Admin
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const user = await User.findById(id);

    if (user) {
        await user.remove();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

/**
 * @description Get user by ID
 * @method GET /api/users/:id
 * @access Private/Admin
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const user = await User.findById(id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(400);
        throw new Error('User not found');
    }
});

/**
 * @description Update user
 * @method PUT /api/users/:id
 * @access Private/Admin
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const user = await User.findById(id);
    if (user) {
        const { name, email, isAdmin } = req.body as {
            name?: string;
            email?: string;
            isAdmin?: boolean;
        };
        user.name = name ? name : user.name;
        user.email = email ? email : user.email;
        if (isAdmin) user.isAdmin = isAdmin;

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin
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
        res.status(200);
        res.send(theWishList);
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

