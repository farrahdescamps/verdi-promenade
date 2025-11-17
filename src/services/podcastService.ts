import { API_BASE_URL, CONCIERGE_API_BASE_URL, apiHeaders, handleApiResponse } from '../config';

export interface PodcastGenerationRequest {
  poi_id: string;
  session_id: string;
  voice?: string;
  force_regenerate?: boolean;
}

export interface PodcastGenerationResponse {
  podcast_url: string;
  title: string;
  duration: number;
  poi_id: string;
  generated_at: string;
}

export interface PodcastHistoryItem {
  poi_id: string;
  podcast_url: string;
  title?: string;
  duration?: number;
  generated_at: string;
}

export interface PodcastHistoryResponse {
  podcasts: PodcastHistoryItem[];
  session_id: string;
  total_count: number;
}

export const generatePodcast = async (
  themeId: string,
  poiId: string,
  sessionId: string,
  voice: string = 'nova',
  forceRegenerate: boolean = false
): Promise<PodcastGenerationResponse> => {
  const url = `${CONCIERGE_API_BASE_URL}/podcast/${encodeURIComponent(themeId)}/${encodeURIComponent(poiId)}`;
  const params = new URLSearchParams({
    session_id: sessionId,
    voice,
    force_regenerate: forceRegenerate.toString()
  });

  console.log('%c🎙️ GENERATE PODCAST', 'background: #8b5cf6; color: white; font-weight: bold; padding: 4px 8px;', {
    themeId,
    poiId,
    sessionId,
    url: `${url}?${params}`
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 seconds timeout

  const response = await fetch(`${url}?${params}`, {
    method: 'POST',
    headers: apiHeaders(),
    body: '',
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('%c❌ PODCAST GENERATION ERROR', 'background: #ef4444; color: white; font-weight: bold; padding: 4px 8px;', {
      status: response.status,
      error: errorText
    });
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }

  const data = await handleApiResponse(response, `${url}?${params}`);
  
  console.log('%c✅ PODCAST GENERATED', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;', {
    themeId,
    poiId,
    podcastUrl: data.podcast_url
  });

  return data;
};

export const fetchPodcastHistory = async (sessionId: string): Promise<PodcastHistoryResponse> => {
  const url = `${CONCIERGE_API_BASE_URL}/podcast/history/${encodeURIComponent(sessionId)}`;

  console.log('%c📜 FETCH PODCAST HISTORY', 'background: #3b82f6; color: white; font-weight: bold; padding: 4px 8px;', {
    sessionId,
    url
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

  const response = await fetch(url, {
    method: 'GET',
    headers: apiHeaders(),
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('%c❌ PODCAST HISTORY ERROR', 'background: #ef4444; color: white; font-weight: bold; padding: 4px 8px;', {
      status: response.status,
      error: errorText
    });
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
  }

  const data = await handleApiResponse(response, url);
  
  console.log('%c✅ PODCAST HISTORY LOADED', 'background: #10b981; color: white; font-weight: bold; padding: 4px 8px;', {
    sessionId,
    totalPodcasts: data.podcasts?.length || 0,
    data
  });

  return data;
};