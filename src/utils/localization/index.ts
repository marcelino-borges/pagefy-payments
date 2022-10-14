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
  payments: string;
  paymentSuccessful: string;
}

const pt: IDictionary = {
  payment: "Pagamento",
  payments: "Pagamentos",
  paymentSuccessful: "Pagamento realizado com sucesso!",
};

const en: IDictionary = {
  payment: "Payment",
  payments: "Payments",
  paymentSuccessful: "Payment finished successfuly!",
};
