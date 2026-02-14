import { defineEventHandler } from 'h3';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';

const toArray = <T>(value: T | T[] | undefined): T[] => (value == null ? [] : Array.isArray(value) ? value : [value]);

const normalizeString = (value: any): string | undefined => {
  if (value == null) return undefined;
  if (Array.isArray(value)) return normalizeString(value[0]);
  if (typeof value === 'object') {
    const record = value as Record<string, any>;
    if ('_' in record) return normalizeString(record._);
    if ('$' in record) return normalizeString(record.$);
    return undefined;
  }
  return String(value);
};

type StationMeta = {
  id: string;
  name: string;
  aliases: string[];
};

const stationIdCache = new Map<string, string>();

const DARMSTADT_STATIONS: StationMeta[] = [
  {
    id: '3024009',
    name: 'Darmstadt Lincoln-Siedlung',
    aliases: ['lincoln', 'lincoln-siedlung', 'lincoln siedlung', 'lincoln siedlg'],
  },
];

const DEFAULT_STATION = DARMSTADT_STATIONS[0]!;
const MAX_DEPARTURES = 5;

const toStringParam = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return toStringParam(value[0]);
  return undefined;
};

const resolveStation = (input?: string): StationMeta => {
  if (!input) return DEFAULT_STATION;
  const candidateId = input.trim();
  const normalized = candidateId.toLowerCase();

  const byId = DARMSTADT_STATIONS.find((station) => station.id === candidateId);
  if (byId) return byId;

  const byName = DARMSTADT_STATIONS.find((station) => station.name.toLowerCase() === normalized || station.aliases.includes(normalized));
  if (byName) return byName;

  throw new Error(
    `Station '${input}' is not supported. Choose one of: ${DARMSTADT_STATIONS.map((station) => station.name).join(', ')}`
  );
};

const parsePayload = async (payload: unknown) => {
  if (typeof payload !== 'string') return payload;
  try {
    return JSON.parse(payload);
  } catch {
    return parseStringPromise(payload);
  }
};

const sanitizeKey = (value?: string) => (value && value !== 'undefined' && value !== 'null' ? value : undefined);

const extractRmvError = (payload: any): string | undefined => {
  if (!payload) return undefined;
  const board = payload.DepartureBoard ?? payload.departureBoard;
  return (
    normalizeString(board?.errorText) ||
    normalizeString(board?.error) ||
    normalizeString(payload.errorText) ||
    normalizeString(payload.error) ||
    normalizeString(payload.message)
  );
};

const resolveRmvStationId = async (station: StationMeta, apiKey: string): Promise<string> => {
  const cached = stationIdCache.get(station.id);
  if (cached) return cached;

  const lookupResponse = await axios.get('https://www.rmv.de/hapi/location.name', {
    params: { accessId: apiKey, format: 'json', input: station.name, maxNo: 20 },
    responseType: 'json',
    headers: { Accept: 'application/json' },
    transformResponse: [(data) => data],
  });

  const lookupData = await parsePayload(lookupResponse.data);
  const unwrapStopLocation = (entry: any) => entry?.StopLocation ?? entry?.stopLocation ?? entry;
  const primaryLocations = toArray(lookupData?.LocationList?.StopLocation).map(unwrapStopLocation);
  const fallbackLocations = toArray(lookupData?.stopLocationOrCoordLocation).map(unwrapStopLocation);
  const locations = [...primaryLocations, ...fallbackLocations];
  const match = locations.find((candidate) => {
    const extId = normalizeString(candidate?.extId);
    const idCandidate = normalizeString(candidate?.id);
    return extId === station.id || idCandidate?.includes(`L=${station.id}@`);
  });

  const rmvStationId = normalizeString(match?.id);
  if (!rmvStationId) {
    const debugLocations = locations.map((candidate) => ({
      name: normalizeString(candidate?.name),
      extId: normalizeString(candidate?.extId),
      id: normalizeString(candidate?.id),
    }));
    console.error('RMV location lookup miss', {
      station: station.name,
      stationId: station.id,
      candidates: debugLocations,
    });
    const debugSummary = debugLocations.map((loc) => `${loc.name ?? 'unknown'} (extId=${loc.extId ?? 'n/a'})`).join('; ');
    throw new Error(`Unable to resolve RMV stop id for ${station.name} (${station.id}). Candidates: ${debugSummary || 'none'}`);
  }

  stationIdCache.set(station.id, rmvStationId);
  return rmvStationId;
};

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig() as { rmvApiKey?: string }
  const query = (event.context?.query ?? {}) as Record<string, unknown>
  const queryKey = sanitizeKey(toStringParam(query.key))
  const configKey = sanitizeKey(runtimeConfig?.rmvApiKey)
  const fallbackKey = sanitizeKey(process.env.RMV_API_KEY ?? process.env.VITE_API_KEY)
  const apiKey = configKey ?? fallbackKey ?? queryKey

  const stationParam = toStringParam(query.station ?? query.stationId ?? query.stop)
  const station = resolveStation(stationParam)

  if (!apiKey) {
    return {
      station,
      error: 'Missing RMV API key. Set RMV_API_KEY (preferred) or VITE_API_KEY in the server environment.',
      departures: []
    }
  }

  try {
    const rmvStationId = await resolveRmvStationId(station, apiKey);

    const departuresResponse = await axios.get('https://www.rmv.de/hapi/departureBoard', {
      params: { accessId: apiKey, format: 'json', id: rmvStationId, duration: 60 },
      responseType: 'json',
      headers: { Accept: 'application/json' },
      transformResponse: [(data) => data],
    });

    const departuresData = await parsePayload(departuresResponse.data);
    const rmvError = extractRmvError(departuresData);
    if (rmvError) {
      throw new Error(rmvError);
    }
    const departureContainer = departuresData?.DepartureBoard ?? departuresData;
    const departuresRaw = departureContainer?.Departure ?? departureContainer?.departure;
    const departures = toArray(departuresRaw);
    if (departures.length === 0) {
      return {
        station,
        error: 'No departures available for this station right now.',
        departures: [],
      };
    }

    const normalizedDepartures = departures.map((dep: Record<string, any>) => {
      const direction = normalizeString(dep.direction);
      const [product] = toArray(dep.Product);
      const line = normalizeString(product?.line) ?? normalizeString(product?.number) ?? normalizeString(product?.name);
      const date = normalizeString(dep.date);
      const time = normalizeString(dep.time);
      const plannedDeparture = date && time ? `${date}T${time}+01:00` : undefined;
      const platform = normalizeString(dep.platform?.text ?? dep.platform);
      const delayMinutes = (() => {
        const rtDate = normalizeString(dep.rtDate);
        const rtTime = normalizeString(dep.rtTime);
        if (!plannedDeparture || !rtDate || !rtTime) return undefined;
        const planned = new Date(plannedDeparture).getTime();
        const realtime = new Date(`${rtDate}T${rtTime}+01:00`).getTime();
        return Math.round((realtime - planned) / 60000);
      })();
      return { line, destination: direction, plannedDeparture, platform, delayMinutes };
    });

    const upcoming = normalizedDepartures
      .filter((dep) => dep.plannedDeparture)
      .sort((a, b) => new Date(a.plannedDeparture!).getTime() - new Date(b.plannedDeparture!).getTime())
      .slice(0, MAX_DEPARTURES);

    return { station, departures: upcoming };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('RMV API error response:', error.response?.status, error.response?.data);
    }
    console.error('Error fetching RMV data:', error);
    const responseData = axios.isAxiosError(error) ? error.response?.data : undefined;
    const responseMessage =
      typeof responseData === 'string'
        ? responseData
        : normalizeString(responseData?.errorText ?? responseData?.message ?? responseData?.error);
    const message = responseMessage || (error instanceof Error ? error.message : 'Unknown RMV API error');
    return {
      station,
      error: message,
      departures: [],
    };
  }
});
