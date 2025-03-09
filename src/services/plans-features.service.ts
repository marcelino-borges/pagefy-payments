import { planFeaturesModel } from "@/models/plans-features.models";
import { AppError } from "@/utils/app-error";

export const getAllPlansFeatures = async () => {
  try {
    const plansFeatures = await planFeaturesModel.find({
      isActive: true,
    });

    return plansFeatures;
  } catch (error) {
    throw new AppError("Error finding plans features.");
  }
};
