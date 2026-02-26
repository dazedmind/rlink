export const formatRelativeTime = (date: string | Date) => {
    const now = new Date();
    const target = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);
  
    // Define the time units in seconds
    const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
      { unit: 'year', seconds: 31536000 },
      { unit: 'month', seconds: 2592000 },
      { unit: 'week', seconds: 604800 },
      { unit: 'day', seconds: 86400 },
      { unit: 'hour', seconds: 3600 },
      { unit: 'minute', seconds: 60 },
      { unit: 'second', seconds: 1 },
    ];
  
    // Find the appropriate unit
    for (const { unit, seconds } of units) {
      if (Math.abs(diffInSeconds) >= seconds || unit === 'second') {
        const value = Math.floor(diffInSeconds / seconds);
        
        // Use Intl for localized, professional formatting
        return new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' }).format(
          -value,
          unit
        );
      }
    }
  
    return 'just now';
  };