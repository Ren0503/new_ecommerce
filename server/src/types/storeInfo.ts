import mongoose, { Document } from 'mongoose';

export interface StoreInfo {
    name: string;
    address: string;
    phone: string;
    link: string;
    position: number;
}

export interface StoreInfoDocument extends StoreInfo, Document {}

export interface StoreInfoModel extends mongoose.Model<StoreInfoDocument> {}