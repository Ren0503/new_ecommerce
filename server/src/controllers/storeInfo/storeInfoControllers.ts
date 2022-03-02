import asyncHandler from "express-async-handler";
import { StoreInfo } from "models";
import { Request, Response } from "types";

export const getStoreInfo = asyncHandler(async (req: Request, res: Response) => {
    const storeInfo = await StoreInfo.find();

    if (storeInfo) {
        res.status(200).send(storeInfo);
    } else {
        res.status(404);
        throw new Error('Can\'t fetch store info');
    }
});