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
  ISubscriptionCreationResult,
  SubscriptionStatus,
} from "../../models/subscription.models";
import log from "../../utils/logs";
import { SYSTEM_EMAIL_CREDENTIALS } from "../../constants";
import { sendEmailToUser } from "../email.service";
import { getHTMLBody } from "../../utils/email";

export const updateSubscriptionFromPaymentIntent = async (
  paymentIntent: IPaymentIntent
) => {
  const updatedSubscription = await SubscriptionsDB.findOneAndUpdate(
    {
      latestInvoice: {
        payment_intent: {
          id: paymentIntent.id,
        },
      },
    },
    {
      latestInvoice: {
        payment_intent: paymentIntent,
      },
      status: paymentIntent.status,
    },
    {
      new: true,
    }
  );
  return updatedSubscription;
};

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

    const updatedSubscription = await updateSubscriptionFromPaymentIntent(
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
                  Por favor tente fazer sua assinatura novamente 
                  <a href="https://socialbio.me">CLICANDO AQUI</a> ou abrindo esse link no seu navegador: https://socialbio.me.
                  <br>
                  <br>
                  Equipe Socialbio<br> 
                  `),
                  text: `
                  Olá, ${userFound.firstName}! Parabéns, seu pagamento foi finalizado com sucesso! Agora você é um assinante ${plan}! Bem-vindo a bordo! Equipe Socialbio (https://www.socialbio.me)`,
                };
              default:
                return {
                  html: `
                  <b>Hey ${userFound.firstName},</b><br>
                  <br>
                  Sorry, your payment failed!<br>
                  Please try to subscribe again.<br>
                  <a href="https://socialbio.me">Click here to try again</a> or open this link your browser: https://socialbio.me.
                  <br>
                  <br>
                  Socialbio Team<br>  
                  `,
                  text: `
                  Hey ${userFound.firstName}! Sorry, your payment failed! Please try to subscribe again. Try again opening this link in your browser: https://socialbio.me. Socialbio Team`,
                };
            }
          };

          userRecipient = {
            name: userFound.firstName,
            email: userFound.email,
            subject: `[Socialbio] ${dictionary.payment}`,
            messageHTML: getEmailMessageByLanguage(language).html,
            messagePlainText: getEmailMessageByLanguage(language).text,
          };
          break;
        }
        case "payment_intent.succeeded": {
          log.success(
            "💰 Pagamento com sucesso para o usuario " + userFound.email
          );

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
              Equipe Socialbio<br>
              <a href="https://socialbio.me">https://www.socialbio.me</a>   
              `),
                  text: `
              Olá, ${userFound.firstName}! Parabéns, seu pagamento foi finalizado com sucesso! Agora você é um assinante ${plan}! Bem-vindo a bordo! Equipe Socialbio (https://www.socialbio.me)
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
              Socialbio Team<br>
              <a href="https://socialbio.me">https://www.socialbio.me</a>   
              `),
                  text: `
              Hey ${
                userFound.firstName
              }! Congratulations, your payment was finished with success! You are now a ${getPlanByPriceId(
                    updatedSubscription.priceId
                  )} subscriber! Welcome onboard! Socialbio Team (https://www.socialbio.me)
              `,
                };
            }
          };

          userRecipient = {
            name: userFound.firstName,
            email: userFound.email,
            subject: `[Socialbio] ${dictionary.paymentSucceed}`,
            messageHTML: getEmailMessageByLanguage(language).html,
            messagePlainText: getEmailMessageByLanguage(language).text,
          };

          if (SYSTEM_EMAIL_CREDENTIALS?.user) {
            const systemRecipient: IEmailRecipient = {
              name: "System",
              email: SYSTEM_EMAIL_CREDENTIALS.user,
              subject: `[Socialbio] ${dictionary.payment}`,
              messageHTML: getHTMLBody(`
              <b>Hey Team!</b><br>
              <br>
              User ${userFound.firstName} (${
                userFound.email
              }) has just paid for a ${plan} subscription of ${amount} (${currency.toUpperCase()})
                <br>
              Socialbio System<br>  
              `),
              messagePlainText: `
              Hey Team! User ${userFound.firstName} (${
                userFound.email
              }) has just paid for a ${plan} subscription of ${amount} (${currency.toUpperCase()}). Socialbio System`,
            };
            sendEmailToUser(systemRecipient);
          }
          break;
        }
        default:
          console.log(`Unhandled event type ${event.type}`);
          break;
      }
    }
  }
};
