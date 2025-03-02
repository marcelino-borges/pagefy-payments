import { IEmailRecipient } from "../../models/email.models";
import UserDb from "../../models/user.models";
import { getDictionayByLanguage } from "../../utils/localization";
import {
  convertPaymentAmountToDecimalString,
  getLanguageFromCurrency,
  getPlanByPriceId,
} from "../../utils/stripe";
import SubscriptionsDB, {
  IPaymentIntent,
} from "../../models/subscription.models";
import log from "../../utils/logs";
import { SYSTEM_EMAIL_CREDENTIALS } from "../../constants";
import {
  getHTMLBody,
  getHTMLButton,
  getHTMLFooterByLanguage,
} from "../../utils/email";
import { sendEmailToUser } from "../email.service";
import * as stripeService from "../stripe.service";
import * as subscriptionsResultsService from "../subscriptions-results.service";

export const handlePaymentIntent = async (event: any) => {
  const paymentIntent: IPaymentIntent = event.data.object;

  const userFound = await UserDb.findOne({
    email: paymentIntent.receipt_email,
  }).lean();

  if (userFound) {
    const currency = paymentIntent.currency;
    const language = getLanguageFromCurrency(currency);
    const dictionary = getDictionayByLanguage(language);
    let userRecipient: IEmailRecipient | undefined = undefined;
    const amount: string = convertPaymentAmountToDecimalString(
      paymentIntent.amount_received
    );

    const updatedSubscription =
      await subscriptionsResultsService.updateSubscriptionResultFromPaymentIntent(
        paymentIntent
      );

    if (updatedSubscription) {
      const plan = getPlanByPriceId(updatedSubscription.priceId);

      switch (event.type) {
        case "payment_intent.payment_failed": {
          log.warn(`⛈️ Pagamento do usuario ${userFound.email} falhou`);

          const getEmailMessageByLanguage = (lang: string) => {
            switch (lang) {
              case "pt":
                return {
                  html: getHTMLBody(`
                  <b>Olá, ${userFound.firstName}!</b><br>
                  <br>
                  Desculpe! Seu pagamento falhou!<br>
                  Por favor tente fazer sua assinatura novamente<br>
                  <br>
                  ${getHTMLButton(process.env.APP_URL ?? "", "CLIQUE AQUI")}<br>
                  <br>
                  ou abra esse link no seu navegador: ${
                    process.env.APP_URL
                  }.<br>
                  <br>
                  <br>
                  ${getHTMLFooterByLanguage(language)}
                  `),
                  text: `
                  Olá, ${userFound.firstName}! Desculpe! Seu pagamento falhou! Por favor tente fazer sua assinatura novamente no ${process.env.APP_URL}. Equipe Pagefy`,
                };
              default:
                return {
                  html: `
                  <b>Hey ${userFound.firstName},</b><br>
                  <br>
                  Sorry, your payment failed!<br>
                  Please try to subscribe again.<br>
                  <br>
                  ${getHTMLButton(process.env.APP_URL ?? "", "CLICK HERE")}<br>
                  <br>
                  or open this link your browser: ${process.env.APP_URL}.
                  <br>
                  <br>
                  ${getHTMLFooterByLanguage(language)}
                  `,
                  text: `
                  Hey ${userFound.firstName}! Sorry, your payment failed! Please try to subscribe again. Try again opening this link in your browser: ${process.env.APP_URL}. Pagefy Team`,
                };
            }
          };

          userRecipient = {
            name: userFound.firstName,
            email: userFound.email,
            subject: `[Pagefy] ${dictionary.payment}`,
            messageHTML: getEmailMessageByLanguage(language).html,
            messagePlainText: getEmailMessageByLanguage(language).text,
          };
          break;
        }
        case "payment_intent.succeeded": {
          log.success(
            "💰 Pagamento com sucesso para o usuario " + userFound.email
          );

          const subscriptionId = (
            await SubscriptionsDB.findOne({ paymentIntentId: paymentIntent.id })
          )?.subscriptionId;

          if (subscriptionId) {
            const schedule = await stripeService.createSubscriptionSchedule(
              subscriptionId
            );

            if (schedule) {
              await SubscriptionsDB.findOneAndUpdate(
                { subscriptionId: updatedSubscription.subscriptionId },
                { subscriptionScheduleId: schedule.id }
              );
            }
          }

          const getEmailMessageByLanguage = (lang: string) => {
            switch (lang) {
              case "pt":
                return {
                  html: getHTMLBody(`
              <b>Olá, ${userFound.firstName}!</b><br>
              <br>
              Parabéns! Seu pagamento foi finalizado com sucesso!<br>
              Agora você é um assinante ${plan}!<br>
              Bem-vindo a bordo!<br>
              <br>
              <br>
              ${getHTMLFooterByLanguage(language)}
              `),
                  text: `
              Olá, ${userFound.firstName}! Parabéns, seu pagamento foi finalizado com sucesso! Agora você é um assinante ${plan}! Bem-vindo a bordo! Equipe Pagefy (${process.env.APP_URL})
              `,
                };
              default:
                return {
                  html: getHTMLBody(`
              <b>Hey ${userFound.firstName},</b><br>
              <br>
              Congratulations! Your payment was finished with success!<br>
              You are now a ${getPlanByPriceId(
                updatedSubscription.priceId
              )} subscriber!<br>
              Welcome onboard!<br>
              <br>
              <br>
              ${getHTMLFooterByLanguage(language)}
              `),
                  text: `
              Hey ${
                userFound.firstName
              }! Congratulations, your payment was finished with success! You are now a ${getPlanByPriceId(
                    updatedSubscription.priceId
                  )} subscriber! Welcome onboard! Pagefy Team (${
                    process.env.APP_URL
                  })
              `,
                };
            }
          };

          userRecipient = {
            name: userFound.firstName,
            email: userFound.email,
            subject: `[Pagefy] ${dictionary.paymentSucceed}`,
            messageHTML: getEmailMessageByLanguage(language).html,
            messagePlainText: getEmailMessageByLanguage(language).text,
          };

          if (SYSTEM_EMAIL_CREDENTIALS?.user) {
            const systemRecipient: IEmailRecipient = {
              name: "System",
              email: SYSTEM_EMAIL_CREDENTIALS.user,
              subject: `[Pagefy] ${dictionary.payment}`,
              messageHTML: getHTMLBody(`
              <b>Hey Team!</b><br>
              <br>
              User ${userFound.firstName} (${
                userFound.email
              }) has just paid for a ${plan} subscription of ${amount} (${currency.toUpperCase()})
                <br>
              Pagefy System<br>  
              `),
              messagePlainText: `
              Hey Team! User ${userFound.firstName} (${
                userFound.email
              }) has just paid for a ${plan} subscription of ${amount} (${currency.toUpperCase()}). Pagefy System`,
            };
            sendEmailToUser(systemRecipient);
          }
          break;
        }
        default:
          console.log(`Unhandled event type ${event.type}`);
          break;
      }
      if (userRecipient) sendEmailToUser(userRecipient);
    } else {
      log.error(`Error udpdating payment intent ${paymentIntent.id} on Mongo`);
    }
  }
};
