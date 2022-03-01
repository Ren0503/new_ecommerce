import { Request as Req, Response as Res, NextFunction as Next } from 'express';
import { LikeAndDislike } from './user';

interface User {
	user?: {
		_id: string;
		name: string;
		email: string;
		isAdmin?: boolean;
		likeAndDislike?: LikeAndDislike[];
	};
}

export type Request = Req & User;
export type Response = Res & User;
export type NextFunction = Next;
