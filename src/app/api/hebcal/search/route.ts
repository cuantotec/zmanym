import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🔍 API: Search route called with URL:', request.url);
  
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    console.log('🔍 API: Query parameter:', query);
    
    if (!query) {
      console.log('🔍 API: No query parameter provided');
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    console.log('🔍 API: Searching for location:', query);

    // Call Hebcal API from server
    const hebcalUrl = `https://www.hebcal.com/complete.php?q=${encodeURIComponent(query)}&geonames=1`;
    console.log('🔍 API: Calling Hebcal URL:', hebcalUrl);

    const response = await fetch(hebcalUrl, {
      headers: {
        'User-Agent': 'Zmanym/1.0',
      },
    });

    if (!response.ok) {
      console.error('🔍 API: Hebcal response not OK:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch from Hebcal API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('🔍 API: Hebcal response data:', data);

    // Transform the data to our format and filter for US locations only
    let locations = [];
    if (Array.isArray(data)) {
      // Filter for US locations only
      const usLocations = data.filter((item: unknown) => {
        const location = item as Record<string, unknown>;
        return location.cc === 'US' || location.country === 'United States';
      });
      
      locations = usLocations.map((item: unknown) => {
        const location = item as Record<string, unknown>;
        const isZipCode = location.geo === 'zip';
        
        return {
          geonameid: (location.id || location.geonameid || location.place_id) as string,
          name: (location.value || location.name || location.title || location.display_name) as string,
          country: (location.country || 'United States') as string,
          admin1: (location.admin1 || location.state || location.region) as string,
          admin2: (location.asciiname || location.city || location.town || location.village) as string,
          isZipCode: isZipCode,
          zipCode: isZipCode ? (location.id || location.geonameid) as string : undefined,
          latitude: location.latitude as number,
          longitude: location.longitude as number
        };
      });
    } else if (data.items && Array.isArray(data.items)) {
      // Filter for US locations only
      const usLocations = data.items.filter((item: unknown) => {
        const location = item as Record<string, unknown>;
        return location.cc === 'US' || location.country === 'United States';
      });
      
      locations = usLocations.map((item: unknown) => {
        const location = item as Record<string, unknown>;
        const isZipCode = location.geo === 'zip';
        
        return {
          geonameid: (location.id || location.geonameid || location.place_id) as string,
          name: (location.value || location.name || location.title || location.display_name) as string,
          country: (location.country || 'United States') as string,
          admin1: (location.admin1 || location.state || location.region) as string,
          admin2: (location.asciiname || location.city || location.town || location.village) as string,
          isZipCode: isZipCode,
          zipCode: isZipCode ? (location.id || location.geonameid) as string : undefined,
          latitude: location.latitude as number,
          longitude: location.longitude as number
        };
      });
    }

    console.log('🔍 API: Returning locations:', locations);
    return NextResponse.json(locations);

  } catch (error) {
    console.error('🔍 API: Error in search route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
