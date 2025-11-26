import { apiClient } from '@/lib/core/http/client';
import { environment } from '@/lib/config/environment';

export const paymentCardsService = {
  async getPaymentCards(userId: string) {
    const url = `${environment.identityApiUrl}/Users/${userId}/cards`;
    return apiClient.get(url);
  },

  async addCard(
    MaskedCardNumber: string,
    ExpiryMonth: number,
    ExpiryYear: number,
    CardHolderName: string,
    CardToken: string,
    IsVirtual: boolean,
    CardType: string
  ) {
    const url = `${environment.identityApiUrl}/PaymentCards`;
    return apiClient.post(url, {
      MaskedCardNumber,
      ExpiryMonth,
      ExpiryYear,
      CardHolderName,
      CardToken,
      IsVirtual,
      CardType,
    });
  },

  async updateCard(
    Id: string,
    MaskedCardNumber: string,
    ExpiryMonth: number,
    ExpiryYear: number,
    CardHolderName: string,
    CardToken: string,
    IsVirtual: boolean
  ) {
    const url = `${environment.identityApiUrl}/PaymentCards`;
    return apiClient.put(url, {
      Id,
      MaskedCardNumber,
      ExpiryMonth,
      ExpiryYear,
      CardHolderName,
      CardToken,
      IsVirtual,
    });
  },

  async deleteCard(id: string) {
    const url = `${environment.identityApiUrl}/PaymentCards/${id}`;
    return apiClient.delete(url);
  },
};

