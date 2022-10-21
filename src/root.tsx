// @refresh reload
import { Show, Suspense } from 'solid-js';
import { Body, ErrorBoundary, FileRoutes, Head, Html, Meta, Routes, Scripts, Title } from 'solid-start';
import { createServerData$ } from 'solid-start/server';
import { ColorSchemeDetector } from '~/lib/main/components/ColorSchemeDetector';
import { getColorScheme } from '~/utils/colorScheme';

import '@unocss/reset/tailwind.css';
import 'uno.css';

const Root = () => {
	const colorScheme = createServerData$(async (_, { request }) => await getColorScheme(request));

	return (
		<Html lang="en">
			<Head>
				<Title>Planotes</Title>
				<Meta charset="utf-8" />
				<Meta name="viewport" content="width=device-width, initial-scale=1" />
				<Suspense>
					<Show when={colorScheme()}>
						<ColorSchemeDetector colorScheme={colorScheme()!} />
					</Show>
				</Suspense>
			</Head>
			<Body class="bg-coolgray-200 dark:bg-coolgray-800">
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
