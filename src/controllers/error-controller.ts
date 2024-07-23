import express from "express";

export interface IError {
  error: Error;
  statusCode: number;
}

const errorController = (
  errObj: IError,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  errObj.statusCode = errObj.statusCode || 500;

  return res.status(errObj.statusCode).json({
    status: `${errObj.statusCode}`.startsWith("4") ? "fail" : "error",
    error: errObj,
  });
};

export default errorController;
