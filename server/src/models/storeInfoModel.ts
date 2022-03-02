import mongoose from 'mongoose';
import { StoreInfoDocument } from 'types';

const storeInfoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    position: {
        lat: Number,
        lng: Number
    }
});

const StoreInfo = mongoose.model<StoreInfoDocument>('StoreInfo', storeInfoSchema);

export default StoreInfo;