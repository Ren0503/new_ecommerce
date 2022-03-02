import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { UserDocument } from 'types';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    },
    wishList: [{
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product'
        },
        productName: {
            type: String,
            required: true
        },
        productPrice: {
            type: Number,
            required: true
        },
        productImage: {
            type: String,
            required: true
        },
        productRating: {
            type: Number,
            required: true
        },
        productNumReviews: {
            type: Number,
            required: true
        },
        onSale: {
            type: Number
        },
        newProduct: Boolean,
        preOrder: Boolean,
    }],
    cartList: [{
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product'
        },
        productName: {
            type: String,
            required: true
        },
        productImage: {
            type: String,
            required: true
        },
        productPrice: {
            type: Number,
            required: true
        },
        onSale: {
            type: Number,
            required: true
        },
        newProduct: Boolean,
        preOrder: Boolean,
        countInStock: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    likeAndDislike: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product'
        },
        reviewId: {
            type: String,
            required: true
        },
        like: {
            type: Boolean,
            required: true
        }
    }],
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
}, {
    timestamps: true
});

userSchema.methods.matchPassword = async function (
    this: UserDocument,
    enteredPassword: string
) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (this: UserDocument, next) {
    if (!this.isModified('password')) next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model<UserDocument>('User', userSchema);

export default User;
