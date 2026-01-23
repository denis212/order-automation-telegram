import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import weekday from 'dayjs/plugin/weekday.js';
import isoWeek from 'dayjs/plugin/isoWeek.js';

dayjs.extend(customParseFormat);
dayjs.extend(weekday);
dayjs.extend(isoWeek);

export interface ParsedDate {
    type: 'single' | 'range';
    dates: string[]; // ISO date strings: "2026-01-23"
}

const DAY_MAP: Record<string, number> = {
    'sun': 0, 'sunday': 0,
    'mon': 1, 'monday': 1,
    'tue': 2, 'tuesday': 2,
    'wed': 3, 'wednesday': 3,
    'thu': 4, 'thursday': 4,
    'fri': 5, 'friday': 5,
    'sat': 6, 'saturday': 6,
};

/**
 * Parse a date string into one or more ISO date strings
 */
export function parseDate(input?: string): ParsedDate {
    const today = dayjs();

    // No input or "today" -> today's date
    if (!input || input.toLowerCase() === 'today') {
        return { type: 'single', dates: [today.format('YYYY-MM-DD')] };
    }

    const lowerInput = input.toLowerCase().trim();

    // "tomorrow" -> tomorrow's date
    if (lowerInput === 'tomorrow') {
        return { type: 'single', dates: [today.add(1, 'day').format('YYYY-MM-DD')] };
    }

    // Date range: "mon-fri", "monday-friday"
    if (lowerInput.includes('-')) {
        const parts = lowerInput.split('-');

        // Check if it's a day range (e.g., "mon-fri")
        if (parts.length === 2) {
            const startDay = DAY_MAP[parts[0].trim()];
            const endDay = DAY_MAP[parts[1].trim()];

            if (startDay !== undefined && endDay !== undefined) {
                return { type: 'range', dates: generateDayRange(startDay, endDay, today) };
            }
        }

        // Try parsing as specific date (e.g., "25-01" or "2026-01-25")
        const parsed = parseSpecificDate(input);
        if (parsed) {
            return { type: 'single', dates: [parsed] };
        }
    }

    // Try day name (e.g., "monday", "tue")
    const dayNum = DAY_MAP[lowerInput];
    if (dayNum !== undefined) {
        const nextDay = getNextDayOfWeek(today, dayNum);
        return { type: 'single', dates: [nextDay.format('YYYY-MM-DD')] };
    }

    // Try specific date formats
    const parsed = parseSpecificDate(input);
    if (parsed) {
        return { type: 'single', dates: [parsed] };
    }

    // Default to today if nothing matches
    return { type: 'single', dates: [today.format('YYYY-MM-DD')] };
}

/**
 * Parse a specific date string in various formats
 */
function parseSpecificDate(input: string): string | null {
    const today = dayjs();
    const currentYear = today.year();

    // Try various formats
    const formats = [
        'YYYY-MM-DD',     // 2026-01-25
        'DD-MM-YYYY',     // 25-01-2026
        'DD-MM',          // 25-01
        'DD/MM/YYYY',     // 25/01/2026
        'DD/MM',          // 25/01
        'D MMM',          // 25 Jan
        'D MMMM',         // 25 January
        'MMM D',          // Jan 25
        'MMMM D',         // January 25
    ];

    for (const format of formats) {
        const parsed = dayjs(input, format, true);
        if (parsed.isValid()) {
            // If no year in format, use current year (or next year if date has passed)
            if (!format.includes('YYYY')) {
                let date = parsed.year(currentYear);
                if (date.isBefore(today, 'day')) {
                    date = date.add(1, 'year');
                }
                return date.format('YYYY-MM-DD');
            }
            return parsed.format('YYYY-MM-DD');
        }
    }

    return null;
}

/**
 * Generate dates for a day range (e.g., Monday to Friday)
 */
function generateDayRange(startDay: number, endDay: number, today: Dayjs): string[] {
    const dates: string[] = [];

    // Get the next occurrence of the start day
    let current = getNextDayOfWeek(today, startDay);

    // Handle wrap-around (e.g., Fri-Mon)
    const daysToGenerate = endDay >= startDay
        ? endDay - startDay + 1
        : 7 - startDay + endDay + 1;

    for (let i = 0; i < daysToGenerate; i++) {
        dates.push(current.format('YYYY-MM-DD'));
        current = current.add(1, 'day');
    }

    return dates;
}

/**
 * Get the next occurrence of a specific day of week
 */
function getNextDayOfWeek(from: Dayjs, dayOfWeek: number): Dayjs {
    const currentDay = from.day();
    let daysToAdd = dayOfWeek - currentDay;

    // If the day has passed this week, get next week's
    if (daysToAdd < 0) {
        daysToAdd += 7;
    }
    // If it's the same day, use today
    if (daysToAdd === 0 && from.isSame(dayjs(), 'day')) {
        return from;
    }

    return from.add(daysToAdd, 'day');
}

/**
 * Get dates for "this week" (Monday to Sunday)
 */
export function getThisWeekDates(): string[] {
    const today = dayjs();
    const monday = today.startOf('isoWeek');
    const dates: string[] = [];

    for (let i = 0; i < 7; i++) {
        dates.push(monday.add(i, 'day').format('YYYY-MM-DD'));
    }

    return dates;
}

/**
 * Format a date for display
 */
export function formatDate(isoDate: string): string {
    return dayjs(isoDate).format('ddd, D MMM YYYY');
}

/**
 * Format a short date for display
 */
export function formatShortDate(isoDate: string): string {
    return dayjs(isoDate).format('ddd, D MMM');
}
