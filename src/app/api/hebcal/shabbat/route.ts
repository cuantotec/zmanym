import { NextRequest, NextResponse } from 'next/server';
import { ZmanimData, ApiErrorResponse, HebcalResponse, HebcalItem } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const geonameid = searchParams.get('geonameid');
    const zipCode = searchParams.get('zip');
    
    if (!geonameid && !zipCode) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Geonameid or zip parameter is required' },
        { status: 400 }
      );
    }

    console.log('🕯️ API: Fetching Shabbat times for geonameid:', geonameid, 'zip:', zipCode);

    // Call Hebcal API from server - use zip parameter if available, otherwise geonameid
    let hebcalUrl: string;
    if (zipCode) {
      hebcalUrl = `https://www.hebcal.com/shabbat?cfg=json&zip=${zipCode}&maj=on&min=on&mod=on&nx=on&year=now&month=x&ss=on&mf=on&c=on`;
    } else {
      hebcalUrl = `https://www.hebcal.com/shabbat?cfg=json&geonameid=${geonameid}&maj=on&min=on&mod=on&nx=on&year=now&month=x&ss=on&mf=on&c=on&geo=geoname&geonameid=${geonameid}`;
    }
    console.log('🕯️ API: Calling Hebcal URL:', hebcalUrl);

    const response = await fetch(hebcalUrl, {
      headers: {
        'User-Agent': 'Zmanym/1.0',
      },
    });

    if (!response.ok) {
      console.error('🕯️ API: Hebcal response not OK:', response.status, response.statusText);
      return NextResponse.json<ApiErrorResponse>(
        { error: 'Failed to fetch from Hebcal API' },
        { status: response.status }
      );
    }

    const data: HebcalResponse = await response.json();
    console.log('🕯️ API: Hebcal response data:', data);

    // Parse the response to extract zmanim data
    const items = data.items || [];
    console.log('🕯️ API: Items found:', items.length);
    console.log('🕯️ API: All items:', items.map((item: HebcalItem) => ({
      category: item.category,
      title: item.title,
      hebrew: item.hebrew
    })));
    
    // Find candle lighting time
    const candleLightingItem = items.find((item: HebcalItem) => 
      item.category === 'candles' && 
      item.title.includes('Candle lighting')
    );
    
    // Find Havdalah time
    const havdalahItem = items.find((item: HebcalItem) => 
      item.category === 'havdalah' && 
      item.title.includes('Havdalah')
    );
    
    // Find Parsha - try multiple patterns
    const parshaItem = items.find((item: HebcalItem) => 
      item.category === 'holiday' && 
      (item.title.includes('Parashat') || item.title.includes('parashat') || item.title.includes('Torah'))
    );
    
    // Find Hebrew date
    const hebrewDateItem = items.find((item: HebcalItem) => 
      item.category === 'holiday' && item.hebrew
    );

    const extractTime = (title: string): string => {
      // Try 12-hour format first (AM/PM)
      let timeMatch = title.match(/(\d{1,2}:\d{2}\s*[AP]M)/i);
      if (timeMatch) {
        return timeMatch[1];
      }
      
      // Try 24-hour format
      timeMatch = title.match(/(\d{1,2}:\d{2})/);
      if (timeMatch) {
        return timeMatch[1];
      }
      
      return 'Not available';
    };

    const candleLighting = candleLightingItem 
      ? extractTime(candleLightingItem.title)
      : 'Not available';
    
    const havdalah = havdalahItem 
      ? extractTime(havdalahItem.title)
      : 'Not available';
    
    let parsha = 'Not available';
    if (parshaItem) {
      parsha = parshaItem.title.replace('Parashat ', '').replace('parashat ', '');
    } else {
      // Try to find Parsha in other categories
      const alternativeParshaItem = items.find((item: HebcalItem) => 
        item.title.includes('Parashat') || item.title.includes('parashat') || 
        item.title.includes('Torah') || item.title.includes('Weekly')
      );
      
      if (alternativeParshaItem) {
        parsha = alternativeParshaItem.title.replace('Parashat ', '').replace('parashat ', '');
      }
    }
    
    const hebrewDate = hebrewDateItem?.hebrew || 'Not available';
    
    const gregorianDate = candleLightingItem 
      ? new Date(candleLightingItem.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'Not available';

    const location = data.location ? 
      `${data.location.city || 'Unknown'}, ${data.location.country || 'Unknown'}` : 
      'Location not available';

    // Parse holidays and find their candle lighting times
    const holidayItems = items.filter((item: HebcalItem) => {
      // Include major holidays, minor holidays, and special days
      return (item.category === 'holiday' || item.category === 'major' || item.category === 'minor') &&
             !item.title.includes('Parashat') && // Exclude Parsha
             !item.title.includes('parashat') &&
             !item.title.includes('Torah') &&
             !item.title.includes('Weekly') &&
             !item.title.includes('Candle lighting') && // Exclude Shabbat times
             !item.title.includes('Havdalah') &&
             !/[\u0590-\u05FF]/.test(item.title); // Exclude Hebrew text
    });

    const holidays = holidayItems.map((holidayItem: HebcalItem) => {
      // Find corresponding candle lighting time for this holiday
      const candleLightingForHoliday = items.find((item: HebcalItem) => 
        item.category === 'candles' && 
        item.memo?.includes(holidayItem.title)
      );
      
      let candleLightingTime = '';
      if (candleLightingForHoliday) {
        const timeMatch = candleLightingForHoliday.title.match(/(\d{1,2}:\d{2}\s*[AP]M)/i);
        candleLightingTime = timeMatch ? timeMatch[1] : '';
        console.log(`🕯️ API: Found candle lighting for ${holidayItem.title}: ${candleLightingTime}`);
      } else {
        console.log(`🕯️ API: No candle lighting found for ${holidayItem.title}`);
      }
      
      return {
        title: holidayItem.title,
        date: holidayItem.date,
        category: holidayItem.category,
        candleLighting: candleLightingTime
      };
    }).slice(0, 10); // Limit to 10 holidays

    console.log('🕯️ API: Parsed data:', {
      candleLighting,
      havdalah,
      parsha,
      gregorianDate,
      hebrewDate,
      location,
      holidays: holidays.length
    });

    const zmanimData: ZmanimData = {
      candleLighting,
      havdalah,
      parsha,
      gregorianDate,
      hebrewDate,
      location,
      holidays
    };

    console.log('🕯️ API: Returning zmanim data:', zmanimData);
    return NextResponse.json<ZmanimData>(zmanimData);

  } catch (error) {
    console.error('🕯️ API: Error in shabbat route:', error);
    return NextResponse.json<ApiErrorResponse>(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
