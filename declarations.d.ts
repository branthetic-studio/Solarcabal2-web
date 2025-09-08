declare module "@paystack/inline-js" {
  export default class PaystackPop {
    newTransaction(config: {
      key: string;
      email: string;
      amount: number;
      reference: string;
      onSuccess?: (response: any) => void;
      onCancel?: () => void;
    }): void;
  }
}
