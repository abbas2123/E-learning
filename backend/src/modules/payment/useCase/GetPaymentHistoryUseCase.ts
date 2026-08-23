import type { IPaymentRepository, PaymentDto } from "../interface/IPaymentRepository";

export class GetPaymentHistoryUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(userId: string): Promise<PaymentDto[]> {
    if (!userId) throw new Error("User required");
    return this.paymentRepository.getUserPayments(userId);
  }

  async executeAll(): Promise<PaymentDto[]> {
    return this.paymentRepository.getAllPayments();
  }
}
