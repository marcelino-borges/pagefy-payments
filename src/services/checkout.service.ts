import { checkoutDB, UserSubscriptions } from "@/models/checkout.models";
import { Plan } from "@/models/stripe/plan.models";
import { AppError } from "@/utils/app-error";

export const getSubsctriptionsByUserId = async (userId: string) => {
  try {
    const checkouts = await checkoutDB
      .find({
        userId,
        subscription: {
          $ne: null,
        },
        invoice: {
          $ne: null,
        },
        charge: {
          $ne: null,
        },
      })
      .sort({
        updatedAt: "asc",
      });

    const remapped = checkouts.map((checkout) => ({
      subscriptionId: checkout.subscription!.id,
      isActive: checkout.subscription!.status === "active",
      interval: (checkout.subscription!.items.data[0].plan as Plan).interval,
      currency: checkout.session.currency,
      onlineReceiptUrl: checkout.charge!.receipt_url,
      price: checkout.charge!.amount_captured,
      captureDate: new Date(checkout.charge!.created * 100),
      planName: checkout.product!.name,
      planImageUrl: checkout.product!.images[0],
      invoiceOnlineUrl: checkout.invoice!.hosted_invoice_url,
      invoiceDownloadPdf: checkout.invoice!.invoice_pdf,
    }));

    return remapped as UserSubscriptions[];
  } catch (error) {
    throw new AppError("Error finding subscriptions.");
  }
};
