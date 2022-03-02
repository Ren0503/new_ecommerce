import asyncHandler from 'express-async-handler';

import { User } from 'models';
import { Request, Response } from 'types';

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

    res.status(200).json({ page: currentPage, pages: Math.ceil(count / totalPageSize), users });
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