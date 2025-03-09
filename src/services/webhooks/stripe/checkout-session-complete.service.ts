import Stripe from "stripe";
import { checkoutModel } from "@/models/checkout.models";
import { Session } from "@/models/stripe/session.models";
import log from "@/utils/logs";
import { getUserByEmailThroughApiKey } from "@/services/user.service";
import { AppError } from "@/utils/app-error";
import { getExpandedCheckoutSessionByIdOnStripe } from "@/services/stripe.service";

export const handleCheckoutSessionComplete = async (
  checkoutSession: Stripe.Checkout.Session
) => {
  if (!checkoutSession.customer_email) {
    throw new AppError(
      "Checkout session doesn't contain a valid customer_email"
    );
  }

  if (!checkoutSession.subscription) {
    throw new AppError("Checkout session doesn't contain a valid subscription");
  }

  const userFound = await getUserByEmailThroughApiKey(
    checkoutSession.customer_email
  );

  if (!userFound) {
    throw new AppError("User doesn't exist.");
  }

  const sessionFound = await getExpandedCheckoutSessionByIdOnStripe(
    checkoutSession.id as string
  );

  const { invoice, subscription, customer, product, ...basicSession } =
    sessionFound as any;

  const sessionToSave = {
    ...basicSession,
    customer: customer.id,
    subscription: subscription.id,
    invoice: invoice.id,
  };

  const { charge, ...basicInvoice } = invoice;

  const updated = await checkoutModel.findOneAndUpdate(
    {
      "session.id": checkoutSession.id,
      userId: userFound._id,
    },
    {
      session: sessionToSave as Session,
      subscription: subscription ?? null,
      invoice: basicInvoice ?? null,
      charge: charge ?? null,
      plan: subscription.items.data[0].plan ?? null,
      price: subscription.items.data[0].price ?? null,
      customer: customer ?? null,
      product: product ?? null,
    },
    {
      new: true,
    }
  );

  if (!updated) {
    log.error(
      `[Services.Webhooks.Stripe.handleCheckoutSessionComplete] Couldn't find Checkout Session with ID ${checkoutSession.id} and userId ${userFound._id} for update`
    );
    return;
  }

  log.success(
    `Success updating Checkout Session with ID ${checkoutSession.id}`
  );
};
