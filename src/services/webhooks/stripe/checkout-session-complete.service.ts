import Stripe from "stripe";
import { checkoutModel } from "@/models/checkout.models";
import { Session } from "@/models/stripe/session.models";
import log from "@/utils/logs";
import { getUserByEmailThroughApiKey } from "@/services/user.service";
import { AppError } from "@/utils/app-error";
import { getExpandedCheckoutSessionByIdOnStripe } from "@/services/stripe.service";
import { getHTMLBody, getHTMLButton } from "@/utils/email";
import { sendEmailToUser } from "@/services/email.service";

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

  let { locale } = sessionToSave as Session;
  const lang = locale?.split("-")[0] ?? "en";

  const pt = `
    <div style="display:flex;flex-direction:column;gap:32px;align-items:center;font-family:sans-serif">
      <img alt="Pagefy logo" src="https://firebasestorage.googleapis.com/v0/b/pagefy-prod.firebasestorage.app/o/system%2Flogo%2Flogo-horizontal-lightbg.png?alt=media&token=be22d60d-bbf9-4faf-b3ff-1bdf4d3317d2" width="200px" height="auto" />
      <div>Obrigado por assinar conosco!</div>
      <div>Você assinou o plano ${
        product.name
      } por ${subscription.items.data[0].price.unit_amount.toFixed(
    2
  )} (${subscription.items.data[0].price.currency.toUpperCase()})</div>
      <div>Clique no botão abaixo para visualizar seu comprovante:</div>
      <div>${getHTMLButton(
        basicInvoice.invoice_pdf,
        "VISUALIZAR COMPROVANTE"
      )}</div>
      <div style="color:gray;font-size:0.8rem">Caso não consiga usar o botão, use este link: <a href="${
        basicInvoice.invoice_pdf
      }" target="_blank" style="text-decoration:none;color:#4335A7">${
    basicInvoice.invoice_pdf
  }</a></div>
    </div>
  `;

  const en = `
    <div style="display:flex;flex-direction:column;gap:32px;align-items:center;font-family:sans-serif">
      <img alt="Pagefy logo" src="https://firebasestorage.googleapis.com/v0/b/pagefy-prod.firebasestorage.app/o/system%2Flogo%2Flogo-horizontal-lightbg.png?alt=media&token=be22d60d-bbf9-4faf-b3ff-1bdf4d3317d2" width="200px" height="auto" />
      <div>Thank you for subscribing with us!</div>
      <div>You have subscribed to ${
        product.name
      } plan for ${subscription.items.data[0].price.unit_amount.toFixed(
    2
  )} (${subscription.items.data[0].price.currency.toUpperCase()})</div>
      <div>Click the button below to view your invoice:</div>
      <div>${getHTMLButton(basicInvoice.invoice_pdf, "VIEW INVOICE")}</div>
      <div style="color:gray;font-size:0.8rem">In case you're not able to use the button, use this link: <a href="${
        basicInvoice.invoice_pdf
      }" target="_blank" style="text-decoration:none;color:#4335A7">${
    basicInvoice.invoice_pdf
  }</a></div>
    </div>
  `;

  const messages: Record<string, string> = { pt, en };
  const subjects: Record<string, string> = {
    pt: "Comprovante da sua assinatura",
    en: "Subscription invoice",
  };

  const emailWithInvoice = `
  ${getHTMLBody(messages[lang])}
  `;

  try {
    await sendEmailToUser({
      email: customer.email,
      name: customer.name,
      messageHTML: emailWithInvoice,
      subject: subjects[lang],
    });
  } catch (error) {
    log.error(
      `[Services.Webhooks.Stripe.handleCheckoutSessionComplete] Couldn't send email with invoice to user ${customer.email}`
    );
  }

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
