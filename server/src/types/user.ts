import mongoose, { Document } from 'mongoose';

export interface WishList {
    itemId: string;
    productName: string;
    productPrice: number;
    productImage: string;
    productRating: number;
    productNumReviews: number;
    onSales: number;
    newProduct?: boolean;
    preOrder?: boolean;
}

export interface CartList {
    itemId: string;
    productName: string;
    productPrice: number;
    productImage: string;
    onSales: number;
    newProduct: boolean;
    preOrder: boolean;
    countInStock: number;
    quantity: number;
}

export interface LikeAndDislike {
    productId: string;
    reviewId: string;
    like: boolean;
}

export interface User {
    name: string;
    email: string;
    password: string;
    avatar: string;
    isAdmin?: boolean;
    wishList: WishList[];
    cartList: CartList[];
    likeAndDislike: LikeAndDislike[];
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
}

export interface UserDocument extends User, Document {
    matchPassword: (password: string) => Promise<boolean>;
}

export interface UserModel extends mongoose.Model<UserDocument> {}