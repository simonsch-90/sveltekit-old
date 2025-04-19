import dayjs, { type Dayjs } from 'dayjs';
import isLeapYear from 'dayjs/plugin/isLeapYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import isoWeeksInYear from 'dayjs/plugin/isoWeeksInYear';
import utc from 'dayjs/plugin/utc';

dayjs.extend(isoWeek);
dayjs.extend(utc);
dayjs.extend(isoWeeksInYear);
dayjs.extend(isLeapYear);

/**
	 * 	console.log('Today: ', today.toISOString());
	console.log('Month:', today.format('MMMM'));
	console.log('Year:', today.format('YYYY'));
	console.log('startOfThisWeek:', startOfThisWeek.toISOString());
	*/

export type RecipeWeek = {
	calendarWeek: number;
	weekDays: {
		date: string;
		day: string;
	}[];
};

export const getToday = () => dayjs().utc(true);
export const getStartOfWeek = (day: Dayjs) => day.startOf('isoWeek');

export const getWeek = (day: Dayjs, whichWeek?: 'next' | 'prev'): RecipeWeek => {
	let startOfWeek = day.startOf('isoWeek');
	switch (whichWeek) {
		case 'next':
			startOfWeek = startOfWeek.add(1, 'week');
			break;
		case 'prev':
			startOfWeek = startOfWeek.subtract(1, 'week');
			break;
	}
	const weekDays = Array.from({ length: 7 }, (_, index) => startOfWeek.add(index, 'day')).map(
		(weekDay) => ({
			date: weekDay.toISOString(),
			day: weekDay.format('dddd'),
		})
	);
	return {
		calendarWeek: startOfWeek.isoWeek(),
		weekDays,
	};
};

export const nextWeek = (week: RecipeWeek) =>
	getWeek(dayjs(week.weekDays[week.weekDays.length - 1].date), 'next');

export const prevWeek = (week: RecipeWeek) => getWeek(dayjs(week.weekDays[0].date), 'prev');
