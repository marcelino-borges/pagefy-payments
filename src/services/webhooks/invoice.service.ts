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
import { createOrUpdatePaidInvoice } from "../invoice.service";

export const handleInvoice = async (event: any) => {
  const invoice: IInvoice = event.data.object as IInvoice;

  const userFound = await UserDb.findOne({
    email: invoice.customer_email,
  }).lean();

  invoice.userId = userFound?._id;

  if (userFound) {
    const currency = invoice.currency;
    const language = getLanguageFromCurrency(currency);
    const dictionary = getDictionayByLanguage(language);
    let userRecipient: IEmailRecipient | undefined = undefined;

    switch (event.type) {
      case "invoice.paid": {
        const getEmailMessageByLanguage = (lang: string) => {
          switch (lang) {
            case "pt":
              return {
                html: getHTMLBody(`
              <b>Olá, ${userFound.firstName}!</b><br>
              <br>
              A nota fiscal para a sua nova assinatura já está disponível!<br>
              Você pode visualizar e baixar aqui:
              <br>
              <br>
              ${getHTMLButton(invoice.invoice_pdf, "NOTA FISCAL")}
              <br>
              <br>
              ou abrindo esse link no seu navegador: ${invoice.invoice_pdf}<br>
              <br>
              <br>
              ${getHTMLFooterByLanguage(language)}
              `),
                text: `
              Olá, ${userFound.firstName}! A nota fiscal para a sua nova assinatura já está disponível! Você pode visualizar e baixar abrindo esse link no seu navegador: ${invoice.invoice_pdf}. Equipe Socialbio (https://www.socialbio.me)`,
              };
            default:
              return {
                html: getHTMLBody(`
              <b>Hey ${userFound.firstName},</b><br>
              <br>
              The invoice for your new subscription is available!<br>
              You can view and download here:
              <br>
              <br>
              ${getHTMLButton(invoice.invoice_pdf, "INVOCIE")}
              <br>
              <br>
              or opening this link in your browser: ${invoice.invoice_pdf}<br>
              <br>
              <br>
              ${getHTMLFooterByLanguage(language)}
              `),
                text: `
              Hey ${userFound.firstName}! The invoice for your new subscription is available! You can view and download opening this link in your browser: ${invoice.invoice_pdf}. Socialbio Team (https://www.socialbio.me)`,
              };
          }
        };

        log.success(`📄 Nota fiscal ${userFound.email} disponível.`);

        userRecipient = {
          name: userFound.firstName,
          email: userFound.email,
          subject: `[Socialbio] ${dictionary.paymentSucceed}`,
          messageHTML: getEmailMessageByLanguage(language).html,
          messagePlainText: getEmailMessageByLanguage(language).text,
        };

        const invoicePersisted = await createOrUpdatePaidInvoice(invoice);
        if (!invoicePersisted)
          log.error(
            `[webhooks/invoice.service/handleInvoice()] Error: Invoice ${invoice.id} not persisted to mongo`
          );

        break;
      }
      default:
        log.error(`Unhandled event type ${event.type}`);
        break;
    }

    if (userRecipient) sendEmailToUser(userRecipient);
  }
};
