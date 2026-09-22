function padLeft(input: string | number, length: number, padChar: string = '0'): string {
    const inputStr: string = input.toString();
    const paddingLength: number = Math.max(0, length - inputStr.length);
    return padChar.repeat(paddingLength) + inputStr;
}

export function convertMinutesToHoursAndMinutes(minutes: number): string {
    if (minutes < 0) {
        throw new Error('Input value must be a non-negative number.');
    }

    const hours: number = Math.floor(minutes / 60);
    const remainingMinutes: number = minutes % 60;

    const hoursStr: string = padLeft(hours, 2);
    const minutesStr: string = padLeft(remainingMinutes, 2);

    return `${hoursStr}:${minutesStr}`;
}

/**
 * Normalizes a time-of-day value to a zero-padded 24-hour "HH:mm" string.
 * Returns an empty string when the value is missing or invalid.
 */
export function normalizeTimeOfDay(value: string): string {
    if (typeof value !== 'string') {
        return '';
    }

    const match = /^(\d{1,2}):(\d{2})/.exec(value);
    if (!match) {
        return '';
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) {
        return '';
    }

    return `${padLeft(hours, 2)}:${padLeft(minutes, 2)}`;
}

/**
 * Converts a valid time-of-day value to minutes elapsed since midnight.
 * Returns null when the value is missing or invalid.
 */
export function minutesOfDay(value: string): number | null {
    const normalized = normalizeTimeOfDay(value);
    if (!normalized) {
        return null;
    }

    const parts = normalized.split(':');
    return Number(parts[0]) * 60 + Number(parts[1]);
}

export function setDay(shortDay):string {
    if (shortDay == "Mon") {
      return "Monday";
    } else if (shortDay == "Tue") {
      return "Tuesday";
    } else if (shortDay == "Wed") {
      return "Wednesday";
    } else if (shortDay == "Thu") {
      return "Thursday";
    } else if (shortDay == "Fri") {
      return "Friday";
    } else if (shortDay == "Sat") {
      return "Saturday";
    } else if (shortDay == "Sun") {
      return "Sunday";
    }
  }

  