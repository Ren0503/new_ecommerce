import mongoose, { Document } from 'mongoose';
import { User } from './user';

export interface Review {
    name: string;
    rating: number;
    comment: string;
    user: string;
    numOfLikes: number;
    likes: User[];
    numOfDislikes: number;
    dislikes: User[];
}

export interface Product {
    user: string;
    name: string;
    image: string;
    subImages: string[];
    brand: string;
    category: string;
    description: string;
    reviews: Review[];
    details: string;
    rating: number;
    price: number;
    numReviews: number;
    onSale: number;
    newProduct: boolean;
    preOrder: boolean;
    numOf5StartsReviews: number;
    numOf4StartsReviews: number;
    numOf3StartsReviews: number;
    numOf2StartsReviews: number;
    numOf1StartsReviews: number;
    countInStock: number;
}

export interface ProductDocument extends Product, Document {}

export interface ProductModel extends mongoose.Model<ProductDocument> {}