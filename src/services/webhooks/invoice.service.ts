import { IEmailRecipient } from "../../models/email.models";
import { IInvoice } from "../../models/invoices.models";
import { getDictionayByLanguage } from "../../utils/localization";
import log from "../../utils/logs";
import {
  convertPaymentAmountToDecimalString,
  getLanguageFromCurrency,
} from "../../utils/stripe";
import { sendEmailToUser } from "../email.service";
import UserDb from "../../models/user.models";

export const handleInvoice = async (event: any) => {
  const invoice: IInvoice = event.data.object as IInvoice;

  const userFound = await UserDb.findOne({
    email: invoice.customer_email,
  }).lean();

  if (userFound) {
    const currency = invoice.currency;
    const language = getLanguageFromCurrency(currency);
    const dictionary = getDictionayByLanguage(language);
    let userRecipient: IEmailRecipient | undefined = undefined;
    const amount: string = convertPaymentAmountToDecimalString(
      invoice.amount_paid
    );

    log.success(`📄 Nota fiscal ${userFound.email} disponível.`);

    const getEmailMessageByLanguage = (lang: string) => {
      switch (lang) {
        case "pt":
          return `
          <b>Olá, ${userFound.firstName}!</b><br>
          <br>
          A nota fiscal para a sua nova assinatura já está disponível!<br>
          Você pode visualizar e baixar aqui: <a href"${invoice.invoice_pdf}">CLICANDO AQUI</a><br>
          <br>
          <br>
          Equipe Socialbio<br>
          <a href"https://socialbio.me">https://www.socialbio.me</a>   
          `;
        default:
          return `
          <b>Hey ${userFound.firstName},</b><br>
          <br>
          The invoice for your new subscription is available!<br>
          You can view and download <a href"${invoice.invoice_pdf}">CLICKING HERE</a><br>
          <br>
          <br>
          Socialbio Team<br>
          <a href"https://socialbio.me">https://www.socialbio.me</a>   
          `;
      }
    };

    switch (event.type) {
      case "invoice.paid":
        userRecipient = {
          name: userFound.firstName,
          email: userFound.email,
          subject: `[Socialbio] ${dictionary.paymentSucceed}`,
          message: getEmailMessageByLanguage(language),
        };
        break;
      default:
        log.error(`Unhandled event type ${event.type}`);
        break;
    }

    if (userRecipient) sendEmailToUser(userRecipient);
  }
};
