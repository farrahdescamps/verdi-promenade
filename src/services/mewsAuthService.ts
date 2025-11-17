import { CONCIERGE_API_BASE_URL, API_KEY } from '../config';

export interface MewsCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  languageCode: string;
  createdUtc: string;
  updatedUtc: string;
}

export interface VerifyCustomerResponse {
  success: boolean;
  authenticated: boolean;
  customer: MewsCustomer;
  hotelName: string;
  message: string;
}

export class MewsAuthService {
  /**
   * Vérifie et récupère les informations d'un client Mews
   */
  async verifyCustomer(
    placeInstanceId: string,
    email: string
  ): Promise<VerifyCustomerResponse | null> {
    try {
      console.log('%c🔐 VERIFY CUSTOMER', 'background: #2563eb; color: white; font-weight: bold; padding: 4px 8px;', {
        placeInstanceId,
        email
      });

      const response = await fetch(
        `${CONCIERGE_API_BASE_URL}/mews-auth/verify-customer`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            'accept': 'application/json'
          },
          body: JSON.stringify({
            placeInstanceId,
            email
          })
        }
      );

      const data = await response.json();

      if (data.success && data.authenticated) {
        console.log('%c✅ CUSTOMER VERIFIED', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;', {
          customer: `${data.customer.firstName} ${data.customer.lastName}`,
          email: data.customer.email
        });
        return data;
      } else {
        console.warn('%c⚠️ CUSTOMER NOT FOUND', 'background: #f59e0b; color: white; font-weight: bold; padding: 4px 8px;', data);
        return null;
      }
    } catch (error: any) {
      console.error('%c❌ VERIFY CUSTOMER ERROR', 'background: #ef4444; color: white; font-weight: bold; padding: 4px 8px;', error);
      return null;
    }
  }

  /**
   * Stocke les informations du client dans le localStorage
   */
  storeCustomerInfo(customer: MewsCustomer): void {
    localStorage.setItem('mews_customer', JSON.stringify(customer));
  }

  /**
   * Récupère les informations du client depuis le localStorage
   */
  getStoredCustomerInfo(): MewsCustomer | null {
    const stored = localStorage.getItem('mews_customer');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Efface les informations du client du localStorage
   */
  clearCustomerInfo(): void {
    localStorage.removeItem('mews_customer');
  }

  /**
   * Obtient le nom complet du client
   */
  getCustomerFullName(): string | null {
    const customer = this.getStoredCustomerInfo();
    if (customer) {
      return `${customer.firstName} ${customer.lastName}`;
    }
    return null;
  }
}

export const mewsAuthService = new MewsAuthService();

