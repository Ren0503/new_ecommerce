import mongoose, { Document } from 'mongoose';
import { User } from './user';

export interface Review {
    _id?: string;
    name: string;
    rating: number;
    comment: string;
    user: string;
    numOfLikes?: number;
    likes?: User[];
    numOfDislikes?: number;
    dislikes?: User[];
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
    numOf5StarsReviews: number;
    numOf4StarsReviews: number;
    numOf3StarsReviews: number;
    numOf2StarsReviews: number;
    numOf1StarsReviews: number;
    countInStock: number;
}

export interface ProductDocument extends Product, Document {}

export interface ProductModel extends mongoose.Model<ProductDocument> {}