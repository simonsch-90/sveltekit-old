export type Gradient = {
	percent: number;
	color: string;
}[];

export const mapValueRange = (
	value: number,
	minFrom: number,
	maxFrom: number,
	minTo: number,
	maxTo: number
) => minTo + (maxTo - minTo) * ((value - minFrom) / (maxFrom - minFrom));

export const interpolateGradientColor = (
	gradientStep1: string,
	gradientStep2: string,
	percent: number
) => {
	const hex = (x: number) => {
		const rounded = Math.round(x);
		const hexValue = (rounded < 16 ? '0' : '') + rounded.toString(16);
		return hexValue.length === 1 ? '0' + hexValue : hexValue;
	};

	const r1 = parseInt(gradientStep1.slice(1, 3), 16);
	const g1 = parseInt(gradientStep1.slice(3, 5), 16);
	const b1 = parseInt(gradientStep1.slice(5, 7), 16);

	const r2 = parseInt(gradientStep2.slice(1, 3), 16);
	const g2 = parseInt(gradientStep2.slice(3, 5), 16);
	const b2 = parseInt(gradientStep2.slice(5, 7), 16);

	const r = Math.round(r1 + (r2 - r1) * percent);
	const g = Math.round(g1 + (g2 - g1) * percent);
	const b = Math.round(b1 + (b2 - b1) * percent);

	return `#${hex(r)}${hex(g)}${hex(b)}`;
};

export const setGradientColor = (
	value: number,
	min: number,
	max: number,
	gradient: Gradient,
	htmlElement: HTMLElement
) => {
	// Map user-defined range to gradient's percentage range
	const normalizedValue = mapValueRange(value, min, max, 0, 100);

	// Calculate the color based on the mapped value
	let selectedColor = '';
	for (let i = 0; i < gradient.length - 1; i++) {
		if (normalizedValue >= gradient[i].percent && normalizedValue <= gradient[i + 1].percent) {
			const percentDiff =
				(normalizedValue - gradient[i].percent) / (gradient[i + 1].percent - gradient[i].percent);
			const color = interpolateGradientColor(gradient[i].color, gradient[i + 1].color, percentDiff);
			selectedColor = color;
			break;
		}
	}
	// Set the background color directly
	htmlElement.style.backgroundColor = selectedColor;
	document.body.style.backgroundColor = selectedColor;
};
