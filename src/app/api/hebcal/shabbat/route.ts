import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const geonameid = searchParams.get('geonameid');
    
    if (!geonameid) {
      return NextResponse.json(
        { error: 'Geonameid parameter is required' },
        { status: 400 }
      );
    }

    console.log('🕯️ API: Fetching Shabbat times for geonameid:', geonameid);

    // Call Hebcal API from server
    const hebcalUrl = `https://www.hebcal.com/shabbat?cfg=json&geonameid=${geonameid}&maj=on&min=on&mod=on&nx=on&year=now&month=x&ss=on&mf=on&c=on&geo=geoname&geonameid=${geonameid}`;
    console.log('🕯️ API: Calling Hebcal URL:', hebcalUrl);

    const response = await fetch(hebcalUrl, {
      headers: {
        'User-Agent': 'Zmanym/1.0',
      },
    });

    if (!response.ok) {
      console.error('🕯️ API: Hebcal response not OK:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch from Hebcal API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('🕯️ API: Hebcal response data:', data);

    // Parse the response to extract zmanim data
    const items = data.items || [];
    console.log('🕯️ API: Items found:', items.length);
    console.log('🕯️ API: All items:', items.map((item: unknown) => {
      const itemData = item as Record<string, unknown>;
      return {
        category: itemData.category,
        title: itemData.title,
        hebrew: itemData.hebrew
      };
    }));
    
    // Find candle lighting time
    const candleLightingItem = items.find((item: unknown) => {
      const itemData = item as Record<string, unknown>;
      return itemData.category === 'candles' && 
             typeof itemData.title === 'string' && 
             itemData.title.includes('Candle lighting');
    });
    
    // Find Havdalah time
    const havdalahItem = items.find((item: unknown) => {
      const itemData = item as Record<string, unknown>;
      return itemData.category === 'havdalah' && 
             typeof itemData.title === 'string' && 
             itemData.title.includes('Havdalah');
    });
    
    // Find Parsha - try multiple patterns
    const parshaItem = items.find((item: unknown) => {
      const itemData = item as Record<string, unknown>;
      const title = itemData.title as string;
      return itemData.category === 'holiday' && 
             typeof title === 'string' && 
             (title.includes('Parashat') || title.includes('parashat') || title.includes('Torah'));
    });
    
    // Find Hebrew date
    const hebrewDateItem = items.find((item: unknown) => {
      const itemData = item as Record<string, unknown>;
      return itemData.category === 'holiday' && itemData.hebrew;
    });

    const extractTime = (title: string): string => {
      const timeMatch = title.match(/(\d{1,2}:\d{2}\s*[AP]M)/i);
      return timeMatch ? timeMatch[1] : 'Not available';
    };

    const candleLighting = candleLightingItem 
      ? extractTime((candleLightingItem as Record<string, unknown>).title as string)
      : 'Not available';
    
    const havdalah = havdalahItem 
      ? extractTime((havdalahItem as Record<string, unknown>).title as string)
      : 'Not available';
    
    let parsha = 'Not available';
    if (parshaItem) {
      const title = (parshaItem as Record<string, unknown>).title as string;
      parsha = title.replace('Parashat ', '').replace('parashat ', '');
    } else {
      // Try to find Parsha in other categories
      const alternativeParshaItem = items.find((item: unknown) => {
        const itemData = item as Record<string, unknown>;
        const title = itemData.title as string;
        return typeof title === 'string' && 
               (title.includes('Parashat') || title.includes('parashat') || 
                title.includes('Torah') || title.includes('Weekly'));
      });
      
      if (alternativeParshaItem) {
        const title = (alternativeParshaItem as Record<string, unknown>).title as string;
        parsha = title.replace('Parashat ', '').replace('parashat ', '');
      }
    }
    
    const hebrewDate = hebrewDateItem 
      ? (hebrewDateItem as Record<string, unknown>).hebrew as string
      : 'Not available';
    
    const gregorianDate = candleLightingItem 
      ? new Date((candleLightingItem as Record<string, unknown>).date as string).toLocaleDateString('en-US', {
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
    const holidayItems = items.filter((item: unknown) => {
      const itemData = item as Record<string, unknown>;
      const category = itemData.category as string;
      const title = itemData.title as string;
      
      // Include major holidays, minor holidays, and special days
      return (category === 'holiday' || category === 'major' || category === 'minor') &&
             typeof title === 'string' &&
             !title.includes('Parashat') && // Exclude Parsha
             !title.includes('parashat') &&
             !title.includes('Torah') &&
             !title.includes('Weekly') &&
             !title.includes('Candle lighting') && // Exclude Shabbat times
             !title.includes('Havdalah') &&
             !/[\u0590-\u05FF]/.test(title); // Exclude Hebrew text
    });

    const holidays = holidayItems.map((holidayItem: unknown) => {
      const holidayData = holidayItem as Record<string, unknown>;
      const holidayTitle = holidayData.title as string;
      const holidayDate = holidayData.date as string;
      const holidayCategory = holidayData.category as string;
      
      // Find corresponding candle lighting time for this holiday
      const candleLightingForHoliday = items.find((item: unknown) => {
        const itemData = item as Record<string, unknown>;
        const memo = itemData.memo as string;
        return itemData.category === 'candles' && 
               typeof memo === 'string' && 
               memo.includes(holidayTitle);
      });
      
      let candleLightingTime = '';
      if (candleLightingForHoliday) {
        const candleTitle = (candleLightingForHoliday as Record<string, unknown>).title as string;
        const timeMatch = candleTitle.match(/(\d{1,2}:\d{2}\s*[AP]M)/i);
        candleLightingTime = timeMatch ? timeMatch[1] : '';
        console.log(`🕯️ API: Found candle lighting for ${holidayTitle}: ${candleLightingTime}`);
      } else {
        console.log(`🕯️ API: No candle lighting found for ${holidayTitle}`);
      }
      
      return {
        title: holidayTitle,
        date: holidayDate,
        category: holidayCategory,
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

    const zmanimData = {
      candleLighting,
      havdalah,
      parsha,
      gregorianDate,
      hebrewDate,
      location,
      holidays
    };

    console.log('🕯️ API: Returning zmanim data:', zmanimData);
    return NextResponse.json(zmanimData);

  } catch (error) {
    console.error('🕯️ API: Error in shabbat route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
