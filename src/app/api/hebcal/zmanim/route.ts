import { NextRequest, NextResponse } from 'next/server';
import { DailyZmanimData, ApiErrorResponse, HebcalZmanimResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const geonameid = searchParams.get('geonameid');
    const zipCode = searchParams.get('zip');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]; // Default to today
    
    if (!geonameid && !zipCode) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Geonameid or zip parameter is required' },
        { status: 400 }
      );
    }

    console.log('🕐 API: Fetching daily zmanim for geonameid:', geonameid, 'zip:', zipCode, 'date:', date);

    // Call Hebcal Zmanim API from server
    let hebcalUrl: string;
    if (zipCode) {
      hebcalUrl = `https://www.hebcal.com/zmanim?cfg=json&zip=${zipCode}&date=${date}`;
    } else {
      hebcalUrl = `https://www.hebcal.com/zmanim?cfg=json&geonameid=${geonameid}&date=${date}`;
    }
    
    console.log('🕐 API: Calling Hebcal Zmanim URL:', hebcalUrl);

    const response = await fetch(hebcalUrl, {
      headers: {
        'User-Agent': 'Zmanym/1.0',
        'Accept-Encoding': 'gzip, br',
      },
    });

    if (!response.ok) {
      console.error('🕐 API: Hebcal response not OK:', response.status, response.statusText);
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Failed to fetch from Hebcal Zmanim API' },
        { status: response.status }
      );
    }

    const data: HebcalZmanimResponse = await response.json();
    console.log('🕐 API: Hebcal Zmanim response data:', data);

    // Parse times and convert to readable format
    const parseTime = (timeString: string): string => {
      if (!timeString) return 'Not available';
      
      try {
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: data.location.tzid
        });
      } catch (error) {
        console.error('🕐 API: Error parsing time:', timeString, error);
        return 'Not available';
      }
    };

    const dailyZmanimData: DailyZmanimData = {
      date: data.date,
      location: data.location,
      times: {
        chatzotNight: parseTime(data.times.chatzotNight),
        alotHaShachar: parseTime(data.times.alotHaShachar),
        misheyakir: parseTime(data.times.misheyakir),
        misheyakirMachmir: parseTime(data.times.misheyakirMachmir),
        dawn: parseTime(data.times.dawn),
        sunrise: parseTime(data.times.sunrise),
        sofZmanShma: parseTime(data.times.sofZmanShma),
        sofZmanShmaMGA: parseTime(data.times.sofZmanShmaMGA),
        sofZmanTfilla: parseTime(data.times.sofZmanTfilla),
        sofZmanTfillaMGA: parseTime(data.times.sofZmanTfillaMGA),
        chatzot: parseTime(data.times.chatzot),
        minchaGedola: parseTime(data.times.minchaGedola),
        minchaKetana: parseTime(data.times.minchaKetana),
        plagHaMincha: parseTime(data.times.plagHaMincha),
        sunset: parseTime(data.times.sunset),
        dusk: parseTime(data.times.dusk),
        beinHaShmashos: parseTime(data.times.beinHaShmashos),
        tzeit7083deg: parseTime(data.times.tzeit7083deg),
        tzeit85deg: parseTime(data.times.tzeit85deg),
        tzeit42min: parseTime(data.times.tzeit42min),
        tzeit50min: parseTime(data.times.tzeit50min),
        tzeit72min: parseTime(data.times.tzeit72min),
      }
    };

    console.log('🕐 API: Returning daily zmanim data:', dailyZmanimData);
    return NextResponse.json<DailyZmanimData>(dailyZmanimData);

  } catch (error) {
    console.error('🕐 API: Error in zmanim route:', error);
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
