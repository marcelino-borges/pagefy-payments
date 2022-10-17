import { IEmailRecipient } from "../../models/email.models";
import { IInvoice } from "../../models/invoices.models";
import { getDictionayByLanguage } from "../../utils/localization";
import log from "../../utils/logs";
import { getLanguageFromCurrency } from "../../utils/stripe";
import { sendEmailToUser } from "../email.service";
import UserDb from "../../models/user.models";
import {
  getHTMLBody,
  getHTMLButton,
  getHTMLFooterByLanguage,
} from "../../utils/email";

export const handleSubscriptionSchedule = async (event: any) => {
  const invoice: IInvoice = event.data.object as IInvoice;

  const userFound = await UserDb.findOne({
    email: invoice.customer_email,
  }).lean();

  if (userFound) {
    const currency = invoice.currency;
    const language = getLanguageFromCurrency(currency);
    const dictionary = getDictionayByLanguage(language);
    let userRecipient: IEmailRecipient | undefined = undefined;

    switch (event.type) {
      case "subscription_schedule.canceled": {
        const getEmailMessageByLanguage = (lang: string) => {
          switch (lang) {
            case "pt":
              return {
                html: getHTMLBody(`
                <b>Olá, ${userFound.firstName}!</b><br>
                <br>
                Infelizmente seu período de assinatura acabou!<br>
                Você pode fazer outra a qualquer momento:<br>
                <br>
                ${getHTMLButton("https://socialbio.me", "CLIQUE AQUI")}<br>
                <br>
                ou abrindo esse link no seu navegador: https://socialbio.me.<br>
                <br>
                <br>
                Equipe Socialbio<br> 
                `),
                text: `
                Olá, ${userFound.firstName}! Infelizmente seu período de assinatura acabou! Você pode fazer outra a qualquer momento através do https://socialbio.me. Equipe Socialbio.`,
              };
            default:
              return {
                html: `
                <b>Hey ${userFound.firstName},</b><br>
                <br>
                Unfortunately your subscription is over!<br>
                You can make another one anytime:<br>
                <br>
                ${getHTMLButton("https://socialbio.me", "CLICK HERE")}<br>
                <br>
                or open this link your browser: https://socialbio.me.<br>
                <br>
                <br>
                Socialbio Team<br>  
                `,
                text: `
                Hey ${userFound.firstName}! Unfortunately your subscription is over! You can make another one anytime at https://socialbio.me. Socialbio Team`,
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
      case "subscription_schedule.expiring": {
        const getEmailMessageByLanguage = (lang: string) => {
          switch (lang) {
            case "pt":
              return {
                html: getHTMLBody(`
                <b>Olá, ${userFound.firstName}!</b><br>
                <br>
                Sua assinatura acaba daqui a 7 dias.<br>
                Você pode fazer outra a qualquer momento:<br>
                <br>
                ${getHTMLButton("https://socialbio.me", "CLIQUE AQUI")}<br>
                <br>
                ou abrindo esse link no seu navegador: https://socialbio.me.<br>
                <br>
                <br>
                Equipe Socialbio<br> 
                `),
                text: `
                Olá, ${userFound.firstName}! Sua assinatura acaba daqui a 7 dias. Você pode fazer outra a qualquer momento através do https://socialbio.me. Equipe Socialbio.`,
              };
            default:
              return {
                html: `
                <b>Hey ${userFound.firstName},</b><br>
                <br>
                Unfortunately your subscription will end in 7 days.<br>
                You can make another one anytime:<br>
                <br>
                ${getHTMLButton("https://socialbio.me", "CLICK HERE")}<br>
                <br>
                or open this link your browser: https://socialbio.me.<br>
                <br>
                <br>
                Socialbio Team<br>  
                `,
                text: `
                Hey ${userFound.firstName}! Unfortunately your subscription will end in 7 days. You can make another one anytime at https://socialbio.me. Socialbio Team`,
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
      default:
        log.error(`Unhandled event type ${event.type}`);
        break;
    }

    if (userRecipient) sendEmailToUser(userRecipient);
  }
};
