import { CONCIERGE_API_BASE_URL, apiHeaders, handleApiResponse } from '../config';

export interface CreateHotelSessionRequest {
  lang_code: string;
  hotel_id: string;
}

export interface CreateHotelSessionResponse {
  success: boolean;
  session_id: string;
  hotel_id: string;
  lang_code: string;
  created_at: string;
}

/**
 * Crée une nouvelle session hôtel
 * @param langCode - Code de langue (ex: "en", "fr", "es")
 * @param hotelId - ID de l'hôtel
 * @returns Données de la session créée
 */
export const createHotelSession = async (
  langCode: string,
  hotelId: string
): Promise<CreateHotelSessionResponse> => {
  const url = `${CONCIERGE_API_BASE_URL}/hotel-session/create`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...apiHeaders(),
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        lang_code: langCode,
        hotel_id: hotelId,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await handleApiResponse(response, url);

    return data as CreateHotelSessionResponse;
  } catch (error) {
    throw error;
  }
};

