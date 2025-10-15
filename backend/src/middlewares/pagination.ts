import {type Request,type Response,type NextFunction } from "express";
import {type Model,type FilterQuery, Document } from "mongoose";


interface PaginationResult<T> {
  currentPage: T[];
  nextPage?: {
    page: number;
    limit: number;
  };
  previousPage?: {
    page: number;
    limit: number;
  };
}


export interface PaginatedResponse<T> extends Response {
  results?: PaginationResult<T>;
}

export function paginationResults<T extends Document>(
  model: Model<T>,
  getFilter?: (req: Request) => FilterQuery<T>
) {
  return async (req: Request, res: PaginatedResponse<T>, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const filter = getFilter ? getFilter(req) : {};

    const results: PaginationResult<T> = { currentPage: [] };

    try {
      const totalDocs = await model.countDocuments(filter).exec();
      results.currentPage = await model
        .find(filter)
        .limit(limit)
        .skip(startIndex)
        .exec();

      if (endIndex < totalDocs) {
        results.nextPage = { page: page + 1, limit };
      }

      if (startIndex > 0) {
        results.previousPage = { page: page - 1, limit };
      }

      res.results = results;
      next();
    } catch (e) {
      res.status(500).json({
        msg: "Something went wrong, try again",
        error: (e as Error).message,
      });
    }
  };
}
