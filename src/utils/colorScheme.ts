import { createCookie } from 'solid-start/session';
import { z } from 'zod';

const colorSchemeSchema = z.enum(['DARK', 'LIGHT', 'SYSTEM']);
const ONE_YEAR_IN_SECONDS = 31_556_926;

const colorSchemeCookie = createCookie('csch', {
	httpOnly: true,
	maxAge: ONE_YEAR_IN_SECONDS,
	path: '/',
	sameSite: 'strict',
	secure: true,
});

export type ColorScheme = z.infer<typeof colorSchemeSchema>;

export const getColorScheme = async (request: Request) => {
	const cookie = await colorSchemeCookie.parse(request.headers.get('cookie'));
	const parsedColorScheme = colorSchemeSchema.safeParse(cookie);

	if (!parsedColorScheme.success) return 'SYSTEM';

	return parsedColorScheme.data;
};

const NEXT_COLOR_SCHEME = {
	DARK: 'LIGHT',
	LIGHT: 'SYSTEM',
	SYSTEM: 'DARK',
} as const satisfies Record<ColorScheme, ColorScheme>;

export const getNextColorScheme = (currentColorScheme: ColorScheme): ColorScheme =>
	NEXT_COLOR_SCHEME[currentColorScheme];

export const createColorSchemeCookie = async (preferedColorScheme: ColorScheme) =>
	colorSchemeCookie.serialize(preferedColorScheme);
