interface Coords {
  lat: number
  lng: number
}

// Simple cache to avoid repeated geocoding requests
const geocodeCache: Record<string, Coords> = {
  'Số 1 Duy Tân, Cầu Giấy, Hà Nội': { lat: 21.028511, lng: 105.782345 },
  '15 Tố Hữu, Nam Từ Liêm, Hà Nội': { lat: 20.999543, lng: 105.783456 },
  'Phúc Xá, Ba Đình, Hà Nội': { lat: 21.045678, lng: 105.845678 },
}

/**
 * Mocks a geocoding service to get coordinates from an address string.
 * In a real app, this would call Google Maps or OpenStreetMap Nominatim API.
 */
export async function geocodeAddress(address: string): Promise<Coords | null> {
  // Check cache first
  if (geocodeCache[address]) {
    return geocodeCache[address]
  }

  try {
    // In a real implementation:
    // const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
    // const data = await response.json()
    // if (data && data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    
    // For this mock, if not in cache, returning null or a randomish Hanoi coord
    console.warn(`Address "${address}" not found in mock geocoder. Using fallback.`)
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

/**
 * Haversine formula to calculate distance in km
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
