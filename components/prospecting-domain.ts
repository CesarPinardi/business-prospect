import type { AppState, Candidate, CityOption, ProfileSettings, SearchCriteria, SearchFilter, SearchSort } from "./prospecting-workspace-types";

export const CITIES: CityOption[] = [
  { id: "jundiai", displayName: "Jundiaí, Brazil", country: "Brazil", latitude: -23.1857, longitude: -46.8978, providerId: "demo:city:jundiai" },
  { id: "sao-paulo", displayName: "São Paulo, Brazil", country: "Brazil", latitude: -23.5505, longitude: -46.6333, providerId: "demo:city:sao-paulo" },
  { id: "lisbon", displayName: "Lisbon, Portugal", country: "Portugal", latitude: 38.7223, longitude: -9.1393, providerId: "demo:city:lisbon" },
];

const businessNames = ["Aurora Dental Studio", "Jardim Coffee Lab", "Northline Pilates", "Casa Verde Interiors", "Atelier Forma", "Ponto Norte Bakery", "Clarity Wellness", "Moinho Creative House", "Lume Hair & Beauty", "Orla Coworking", "Vértice Accounting", "Semente Pet Care", "Bossa Home Market", "Canto Legal Office", "Estação Bike Shop", "Brisa Florist", "Prumo Architecture", "Vale Language School", "Linha Viva Clinic", "Núcleo Fitness", "Azul Event Studio", "Mata Garden Center", "Pé de Serra Market", "Traço Design Office", "Ponte Music School", "Raiz Nutrition", "Farol Auto Care", "Vila Frame Shop", "Horizonte Clinic", "Alvorada Kitchen"];
const distances = [0.6, 0.9, 1.3, 1.8, 2.2, 2.7, 3.1, 3.6, 4.2, 4.8, 5.2, 5.8, 6.4, 7.1, 7.7, 8.3, 8.9, 9.5, 1.1, 2.5, 4.5, 6.8, 8.1, 9.8, 7.3, 8.7, 10.7, 12.1, 13.4, 14.5];
const angles = [12, 94, 178, 252, 320, 43, 126, 207, 286, 352, 68, 151, 230, 304, 25, 112, 189, 271, 337, 55, 145, 218, 298, 5, 82, 165, 245, 326, 38, 132];

export const DEFAULT_SETTINGS: ProfileSettings = {
  name: "",
  businessName: "",
  offeredService: "",
  baseMessage: "",
};

export const DEFAULT_SEARCH_CRITERIA: SearchCriteria = { cityId: "", niche: "", radiusKm: 5, websiteFilter: "all", photoFilter: "all", phoneFilter: "all", sort: "relevance" };

export function createInitialState(): AppState {
  return { settings: { ...DEFAULT_SETTINGS }, searches: [], nicheHistory: [] };
}

export function getCity(cityId: string): CityOption | undefined { return CITIES.find((city) => city.id === cityId); }

export function haversineDistanceKm(latitudeA: number, longitudeA: number, latitudeB: number, longitudeB: number): number {
  const earthRadiusKm = 6371;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const latitudeDelta = toRadians(latitudeB - latitudeA);
  const longitudeDelta = toRadians(longitudeB - longitudeA);
  const value = Math.sin(latitudeDelta / 2) ** 2 + Math.cos(toRadians(latitudeA)) * Math.cos(toRadians(latitudeB)) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function pointAtDistance(city: CityOption, distanceKm: number, angleDegrees: number) {
  const angle = (angleDegrees * Math.PI) / 180;
  return { latitude: city.latitude + (distanceKm / 111.32) * Math.cos(angle), longitude: city.longitude + (distanceKm / (111.32 * Math.cos((city.latitude * Math.PI) / 180))) * Math.sin(angle) };
}

export function generateDemoCandidates(city: CityOption, niche: string): Candidate[] {
  const normalizedNiche = niche.trim() || "local businesses";
  return businessNames.map((name, index) => {
    const point = pointAtDistance(city, distances[index], angles[index]);
    const phoneAvailable = index % 5 !== 2 && index % 7 !== 1;
    const websiteAvailable = index % 4 !== 1 && index % 6 !== 0;
    const photoAvailable = index % 3 !== 1;
    return { providerId: `demo:place:${city.id}:${String(index + 1).padStart(2, "0")}`, name, category: normalizedNiche, address: `${index + 10} ${["Rua das Flores", "Avenida Central", "Rua do Mercado", "Alameda Norte"][index % 4]}, ${city.displayName.split(",")[0]}`, ...point, distanceKm: haversineDistanceKm(city.latitude, city.longitude, point.latitude, point.longitude), ...(phoneAvailable ? { phone: index % 2 === 0 ? "+55 11 98888 1200" : "+351 910 555 240" } : {}), ...(websiteAvailable ? { website: `https://demo.prospect.local/${city.id}/${index + 1}` } : {}), ...(photoAvailable ? { photoUrl: `https://images.example.test/demo/${city.id}/${index + 1}.jpg` } : {}), providerUrl: `https://maps.google.com/?cid=${city.providerId}-${index + 1}`, sourceAttribution: "Demo provider · sample data", relevanceOrder: index } satisfies Candidate;
  });
}

export function getDemoProviderPage(city: CityOption, niche: string, page: number): Candidate[] {
  const normalizedNiche = niche.trim().toLowerCase();
  if (normalizedNiche.includes("[provider-error]")) throw new Error("Demo provider unavailable");
  return generateDemoCandidates(city, niche).slice(page * 10, page * 10 + 10);
}

export function isListed(value: string | undefined, filter: SearchFilter): boolean { return filter === "all" || (filter === "listed" ? Boolean(value) : !value); }
export function filterCandidates(candidates: Candidate[], criteria: SearchCriteria): Candidate[] { return candidates.filter((candidate) => isListed(candidate.website, criteria.websiteFilter) && isListed(candidate.photoUrl, criteria.photoFilter) && isListed(candidate.phone, criteria.phoneFilter)); }
export function sortCandidates(candidates: Candidate[], sort: SearchSort): Candidate[] { return [...candidates].sort((first, second) => sort === "distance" ? first.distanceKm - second.distanceKm : sort === "name" ? first.name.localeCompare(second.name) : first.relevanceOrder - second.relevanceOrder); }
export function getCurrentPage(candidates: Candidate[], criteria: SearchCriteria, page: number): Candidate[] { return sortCandidates(filterCandidates(candidates, criteria), criteria.sort).slice((page - 1) * 10, page * 10); }
export function candidateWithinRadius(candidate: Candidate, city: CityOption, radiusKm: number): boolean { return haversineDistanceKm(city.latitude, city.longitude, candidate.latitude, candidate.longitude) <= radiusKm; }

export function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function validateSettings(settings: ProfileSettings): Partial<Record<keyof ProfileSettings, string>> {
  const errors: Partial<Record<keyof ProfileSettings, string>> = {};
  const labels: Record<keyof ProfileSettings, string> = {
    name: "Name",
    businessName: "Business name",
    offeredService: "Offered service",
    baseMessage: "Base outreach message",
  };
  for (const key of Object.keys(labels) as (keyof ProfileSettings)[]) {
    const value = settings[key].trim();
    if (!value) errors[key] = `${labels[key]} is required.`;
    if (value.length > 500) errors[key] = `${labels[key]} must be 500 characters or fewer.`;
  }
  return errors;
}
