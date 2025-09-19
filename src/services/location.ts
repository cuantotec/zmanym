// Location service for handling geolocation and location management

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationInfo {
  name: string;
  coordinates: Coordinates;
  geonameid?: string;
}

class LocationService {
  private readonly STORAGE_KEY = 'zmanym_location';

  // Get user's current location using browser geolocation API
  async getCurrentLocation(): Promise<Coordinates> {
    console.log('🌍 LocationService: getCurrentLocation called');
    
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.error('🌍 LocationService: Geolocation not supported');
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      console.log('🌍 LocationService: Requesting geolocation...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          console.log('🌍 LocationService: Got coordinates:', coords);
          resolve(coords);
        },
        (error) => {
          console.error('🌍 LocationService: Geolocation error:', error);
          let errorMessage = 'Unable to get your location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          
          console.error('🌍 LocationService: Error message:', errorMessage);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Save location to localStorage
  saveLocation(location: LocationInfo): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(location));
    } catch (error) {
      console.error('Failed to save location to localStorage:', error);
    }
  }

  // Get saved location from localStorage
  getSavedLocation(): LocationInfo | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to get saved location from localStorage:', error);
      return null;
    }
  }

  // Clear saved location
  clearSavedLocation(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear saved location from localStorage:', error);
    }
  }

  // Check if geolocation is available
  isGeolocationAvailable(): boolean {
    return 'geolocation' in navigator;
  }

  // Get location name from coordinates (reverse geocoding)
  async getLocationName(coordinates: Coordinates): Promise<string> {
    console.log('🌍 LocationService: getLocationName called with coordinates:', coordinates);
    
    try {
      // Using a simple reverse geocoding service
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&localityLanguage=en`;
      console.log('🌍 LocationService: Fetching reverse geocoding URL:', url);
      
      const response = await fetch(url);
      console.log('🌍 LocationService: Reverse geocoding response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();
      console.log('🌍 LocationService: Reverse geocoding data:', data);
      
      const city = data.city || data.locality || 'Unknown';
      const country = data.countryName || 'Unknown';
      const locationName = `${city}, ${country}`;
      
      console.log('🌍 LocationService: Resolved location name:', locationName);
      return locationName;
    } catch (error) {
      console.error('🌍 LocationService: Error getting location name:', error);
      return 'Current Location';
    }
  }
}

export const locationService = new LocationService();
