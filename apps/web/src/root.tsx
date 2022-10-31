// @refresh reload
import { Match, Show, Suspense, Switch } from 'solid-js';
import { Body, ErrorBoundary, FileRoutes, Head, Html, Meta, Routes, Scripts, Title } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { type ColorScheme, getColorScheme } from '~/lib/utils/colorScheme';

import '@unocss/reset/tailwind.css';
import 'uno.css';

const ColorSchemeDetector = (props: { colorScheme: ColorScheme }) => (
	<Switch>
		<Match when={props.colorScheme === 'DARK'}>
			<script>document.documentElement.classList.add('dark')</script>
		</Match>
		<Match when={props.colorScheme === 'SYSTEM'}>
			<script>
				if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.add('dark');
			</script>
		</Match>
	</Switch>
);

const Root = () => {
	const colorScheme = createServerData$(async (_, { request }) => getColorScheme(request));

	return (
		// Using classList here to workaround hydration removing 'dark' class
		<Html lang="en" classList={{ 'h-full': true }}>
			<Head>
				<Title>Planotes</Title>
				<Meta charset="utf-8" />
				<Meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
				<link rel="manifest" href="/site.webmanifest" />
				<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#171717" />
				<meta name="msapplication-TileColor" content="#171717" />
				<meta name="theme-color" content="#171717" />
				<Suspense>
					<Show when={colorScheme()}>
						<ColorSchemeDetector colorScheme={colorScheme()!} />
					</Show>
				</Suspense>
			</Head>
			<Body class="text-primary bg-primary h-full">
				<Suspense>
					<ErrorBoundary>
						<Routes>
							<FileRoutes />
						</Routes>
					</ErrorBoundary>
				</Suspense>
				<Scripts />
			</Body>
		</Html>
	);
};

export default Root;
