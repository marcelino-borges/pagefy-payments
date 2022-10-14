export const getDictionayByLanguage = (
  language: "pt" | "en" = "en"
): IDictionary => {
  switch (language) {
    case "pt":
      return pt;
    default:
      return en;
  }
};

interface IDictionary {
  payment: string;
  paymentSucceed: string;
  paymentFailed: string;
  payments: string;
  paymentSuccessful: string;
}

const pt: IDictionary = {
  payment: "Pagamento",
  paymentSucceed: "Pagamento com sucesso",
  paymentFailed: "Pagamento falhou",
  payments: "Pagamentos",
  paymentSuccessful: "Pagamento realizado com sucesso!",
};

const en: IDictionary = {
  payment: "Payment",
  paymentFailed: "Payment succeeded",
  paymentSucceed: "Payment failed",
  payments: "Payments",
  paymentSuccessful: "Payment finished successfuly!",
};
