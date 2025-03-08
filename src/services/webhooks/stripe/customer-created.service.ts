import { updateUserPaymentId } from "@/services/user.service";
import { AppError } from "@/utils/app-error";
import log from "@/utils/logs";
import { Stripe } from "stripe";

export const handleCustomerCreated = async (customer: Stripe.Customer) => {
  if (!customer.email) {
    throw new AppError("Customer doesn't contain a valid email");
  }

  const updatedUser = await updateUserPaymentId(customer.email, customer.id);

  if (!updatedUser) {
    log.error(
      `[Services.Webhooks.Stripe.handleCustomerCreated] Couldn't find user to update paymentId (email ${customer.email}, customerId ${customer.id})`
    );
    return;
  }

  log.success(
    `Success updating paymentId in registration API for user with email ${customer.email} (customerId ${customer.id})`
  );
};
