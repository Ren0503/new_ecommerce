import express from 'express';
import { getStoreInfo } from 'controllers/storeInfo';

const router = express.Router();
router.route('/').get(getStoreInfo);
export default router;