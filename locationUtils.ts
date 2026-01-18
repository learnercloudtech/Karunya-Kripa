

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export const getCurrentLocation = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error("Geolocation is not supported by your browser."));
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("User denied the request for Geolocation."));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("Location information is unavailable."));
            break;
          case error.TIMEOUT:
            reject(new Error("The request to get user location timed out."));
            break;
          default:
            reject(new Error("An unknown error occurred."));
            break;
        }
      },
      {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
      }
    );
  });
};

/**
 * Uses OpenStreetMap Nominatim API to get an address from coordinates.
 */
export const reverseGeocode = async (coords: Coordinates): Promise<string> => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=18&addressdetails=1`,
            {
                headers: {
                    'Accept-Language': 'en-US,en;q=0.9',
                    'User-Agent': 'KarunyaKripa/1.0' // Identifying User-Agent often helps avoid generic blocks
                }
            }
        );
        if (!response.ok) {
            throw new Error("Failed to fetch address");
        }
        const data = await response.json();
        
        // Construct a cleaner address
        const addr = data.address || {};
        const components = [
            addr.road,
            addr.suburb,
            addr.city || addr.town || addr.village,
            addr.state_district,
            addr.state
        ].filter(Boolean); // Remove undefined/null

        const simpleAddress = components.slice(0, 3).join(', '); // Take top 3 meaningful parts
        
        return simpleAddress || data.display_name || `${coords.latitude}, ${coords.longitude}`;
    } catch (error) {
        console.warn("Reverse geocoding failed:", error);
        return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
    }
};

/**
 * Uses OpenStreetMap Nominatim API to get coordinates from a query string.
 */
export const forwardGeocode = async (query: string): Promise<{coords: Coordinates, displayName: string} | null> => {
    try {
        // Clean the query: remove "Near", "Opposite", etc. which confuse simple geocoders
        const cleanQuery = query
            .replace(/^(near|opposite|behind|next to|close to)\s+/i, '')
            .trim();

        // Use viewbox to prioritize Mangalore (approx Lat 12.8-13.1, Lon 74.7-75.0)
        // bounded=0 means prefer but don't strictly restrict (allows finding well-known places outside if exact match fails)
        const viewbox = '74.7,12.8,75.0,13.1';

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanQuery)}&format=json&limit=1&countrycodes=in&addressdetails=1&viewbox=${viewbox}&bounded=0`,
            {
                headers: {
                    'User-Agent': 'KarunyaKripa/1.0'
                }
            }
        );
        if (!response.ok) {
            throw new Error("Failed to fetch coordinates");
        }
        const data = await response.json();
        if (data && data.length > 0) {
            return {
                coords: {
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon)
                },
                displayName: data[0].display_name
            };
        }
        return null;
    } catch (error) {
        console.warn("Forward geocoding failed:", error);
        return null;
    }
};