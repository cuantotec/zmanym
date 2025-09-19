import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    
    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude parameters are required' },
        { status: 400 }
      );
    }

    console.log('🌍 API: Getting geonameid for coordinates:', lat, lng);

    // Call Hebcal API from server
    const hebcalUrl = `https://www.hebcal.com/complete.php?geo=${lat},${lng}&v=1`;
    console.log('🌍 API: Calling Hebcal URL:', hebcalUrl);

    const response = await fetch(hebcalUrl, {
      headers: {
        'User-Agent': 'Zmanym/1.0',
      },
    });

    if (!response.ok) {
      console.error('🌍 API: Hebcal response not OK:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch from Hebcal API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('🌍 API: Hebcal response data:', data);

    // Extract geonameid from response
    let geonameid = null;
    if (Array.isArray(data) && data.length > 0) {
      geonameid = data[0].geonameid || data[0].id || data[0].place_id;
    } else if (data.items && Array.isArray(data.items) && data.items.length > 0) {
      geonameid = data.items[0].geonameid || data.items[0].id || data.items[0].place_id;
    }

    if (!geonameid) {
      console.error('🌍 API: No geonameid found in response');
      return NextResponse.json(
        { error: 'No location found for coordinates' },
        { status: 404 }
      );
    }

    console.log('🌍 API: Returning geonameid:', geonameid);
    return NextResponse.json({ geonameid });

  } catch (error) {
    console.error('🌍 API: Error in coords route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
