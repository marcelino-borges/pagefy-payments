import { Request, Response } from "express";
import { HttpStatusCode } from "axios";
import * as plansFeaturesServices from "@/services/plans-features.service";
import log from "@/utils/logs";
import AppResult from "@/utils/app-result";

export const getAllPlansFeatures = async (_: Request, res: Response) => {
  try {
    const plansFeatures = await plansFeaturesServices.getAllPlansFeatures();

    res.status(HttpStatusCode.Ok).send(plansFeatures);
  } catch (error) {
    log.error(
      "[PlansFeaturesController.getAllPlansFeatures] EXCEPTION: ",
      error
    );

    const result = AppResult.fromError(error);
    res.status(result.statusCode).json(result);
  }
};
