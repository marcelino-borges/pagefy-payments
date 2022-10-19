import InvoicesDB, { IInvoice } from "../models/invoices.models";

export const getUserInvoices = async (userId: string) => {
  return await InvoicesDB.find({
    userId: userId,
  });
};

export const getUserInvoiceByInvoiceId = async (invoiceId: string) => {
  return await InvoicesDB.findOne({
    $or: [{ _id: invoiceId }, { id: invoiceId }],
  });
};

export const createOrUpdatePaidInvoice = async (
  invoice: IInvoice
): Promise<IInvoice> => {
  const invoiceUpdated = (
    await InvoicesDB.findOneAndUpdate({
      $or: [
        { _id: invoice.id },
        { id: invoice.id },
        { _id: invoice._id },
        { id: invoice._id },
      ],
    })
  )?.toObject() as IInvoice;

  if (!invoiceUpdated)
    return (await InvoicesDB.create(invoice)).toObject() as IInvoice;

  return invoiceUpdated;
};
