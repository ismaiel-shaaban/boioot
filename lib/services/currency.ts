import { environment } from '@/lib/config/environment';

interface CurrencyRates {
  SYP: number;
  USD: number;
}

class CurrencyService {
  private rates: CurrencyRates = {
    SYP: 1,
    USD: 15000, // Default rate, will be updated from API
  };

  constructor() {
    this.loadRates();
    // Update rates every 5 minutes
    setInterval(() => this.loadRates(), 5 * 60 * 1000);
  }

  private async loadRates() {
    try {
      // Load currency rates from API if available
      // For now, using default rates
    } catch (error) {
      console.error('Error loading currency rates:', error);
    }
  }

  formatPrice(price: number, isUsd: boolean): string {
    if (isUsd) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    } else {
      return `${price.toLocaleString('ar-SY')} ل.س`;
    }
  }

  convertToSYP(price: number, isUsd: boolean): number {
    if (isUsd) {
      return price * this.rates.USD;
    }
    return price;
  }

  convertToUSD(price: number, isUsd: boolean): number {
    if (!isUsd) {
      return price / this.rates.USD;
    }
    return price;
  }

  formatCurrencyWithConversion(sypAmount: number): string {
    const usdAmount = this.convertToUSD(sypAmount, false);
    return `${sypAmount.toLocaleString('ar-SA')} ليرة / ${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} دولار`;
  }

  formatPriceByCurrency(price: number, isUsd?: boolean): string {
    if (!price || price <= 0) return 'السعر غير متوفر';
    if (isUsd) {
      return `${price.toLocaleString('ar-SA')} دولار`;
    } else {
      return `${price.toLocaleString('ar-SA')} ليرة`;
    }
  }
}

export const currencyService = new CurrencyService();

