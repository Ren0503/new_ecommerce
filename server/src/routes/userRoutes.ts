import express from 'express';
import { protect, admin } from '../middleware';
import {
    login,
    register,
    getUserProfile,
    updateUserProfile,
    getCurrentUserStatus,

    getWishListItems,
    addItemToUserWishList,
    deleteItemFromWishlist,
    deleteAllItemFromWishlist,

    addItemToCart,
    removeItemFromCart,
    getUserCartList,

    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    
    matchEmailByToken,
    updatePasswordByEmail,
} from '../controllers/userControllers';

const router = express.Router();

router
    .route('/login')
    .post(login);

router
    .route('/')
    .post(register)
    .get(protect, admin, getUsers);

router
    .route('/delete/:id')
    .delete(protect, admin, deleteUser);

router
    .route('/current_status')
    .get(protect, getCurrentUserStatus);

router
    .route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile)

router
    .route('/wishlist/add_item')
    .post(protect, addItemToUserWishList)

router
    .route('/wishlist/delete_item')
    .delete(protect, deleteAllItemFromWishlist);

router
    .route('/wishlist/delete_item/:id')
    .delete(protect, deleteItemFromWishlist)
router
    .route('/wishlist')
    .get(protect, getWishListItems)

router
    .route('/cart/add_item')
    .post(protect, addItemToCart)

router
    .route('/cart/remove_item/:id')
    .delete(protect, removeItemFromCart)

router
    .route('/cart')
    .get(protect, getUserCartList)

router
    .route('/:id')
    .get(protect, admin, getUserById)
    .put(protect, admin, updateUser)

router.route('/updatePasswordViaEmail').post(updatePasswordByEmail)
router.route('/:resetPasswordToken').get(matchEmailByToken)

export default router;