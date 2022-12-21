import { randomBytes } from 'node:crypto';
import { SessionDuration } from '@prisma/client';
import { Show } from 'solid-js';
import { FormError, useRouteData } from 'solid-start';
import { createServerAction$, createServerData$, redirect, ServerError } from 'solid-start/server';
import { z } from 'zod';
import { Button } from '~/shared/components/Button';
import { Checkbox } from '~/shared/components/Checkbox';
import { Input } from '~/shared/components/Input';
import { REDIRECTS } from '~/shared/constants/redirects';
import { db } from '~/shared/utils/db';
import {
	type FormErrors,
	COMMON_FORM_ERRORS,
	convertFormDataIntoObject,
	createFormFieldsErrors,
	zodErrorToFieldErrors,
} from '~/shared/utils/form';
import { sendEmailWithMagicLink } from '~/shared/utils/mail';
import {
	createMagicIdentifierCookie,
	getMagicIdentifier,
	isSignedIn,
	MAGIC_LINK_REQUIRED_GENERATION_DELAY_IN_MINUTES,
	MAGIC_LINK_VALIDITY_IN_MINUTES,
} from '~/shared/utils/session';
import { getDateWithOffset } from '~/shared/utils/time';

export const routeData = () =>
	createServerData$(async (_, { request }) => {
		if (await isSignedIn(request)) throw redirect(REDIRECTS.HOME);
	});

const FORM_ERRORS = {
	EMAIL_INVALID: 'Email address is invalid',
	EMAIL_REQUIRED: 'Email address is required',
	MAIL_SENDING_FAILED: 'There was a problem with sending you an email, try again',
	TOO_MANY_REQUESTS: 'Too many magic link requests for the same email address and device',
} as const satisfies FormErrors;

const SignIn = () => {
	useRouteData<typeof routeData>()();

	const [signIn, signInTrigger] = createServerAction$(async (formData: FormData, { request }) => {
		const signInSchema = z.object({
			email: z
				.string({ invalid_type_error: FORM_ERRORS.EMAIL_INVALID, required_error: FORM_ERRORS.EMAIL_REQUIRED })
				.email(FORM_ERRORS.EMAIL_INVALID),
			rememberMe: z.coerce.boolean(),
		});

		if (await isSignedIn(request)) throw redirect(REDIRECTS.HOME);

		const parsedFormData = signInSchema.safeParse(convertFormDataIntoObject(formData));

		if (!parsedFormData.success) {
			const errors = parsedFormData.error.formErrors;

			throw new FormError(COMMON_FORM_ERRORS.BAD_REQUEST, {
				fieldErrors: zodErrorToFieldErrors(errors),
			});
		}

		const { email } = parsedFormData.data;
		const sessionDuration = parsedFormData.data.rememberMe ? SessionDuration.PERSISTENT : SessionDuration.EPHEMERAL;

		const { id: userId } = await db.user.upsert({
			create: {
				email,
			},
			update: {},
			where: {
				email,
			},
		});

		const previousMagicLink = await db.magicLink.findFirst({
			where: {
				userId: {
					equals: userId,
				},
				validUntil: {
					gte: getDateWithOffset({
						minutes: MAGIC_LINK_VALIDITY_IN_MINUTES - MAGIC_LINK_REQUIRED_GENERATION_DELAY_IN_MINUTES,
					}).epochSeconds,
				},
			},
		});

		const magicIdentifier = await getMagicIdentifier(request);

		if (previousMagicLink && magicIdentifier) throw new FormError(FORM_ERRORS.TOO_MANY_REQUESTS);

		const token = randomBytes(32).toString('base64url');
		const { id: magicLinkId } = await db.magicLink.create({
			data: {
				sessionDuration,
				token,
				userId,
				validUntil: getDateWithOffset({ minutes: MAGIC_LINK_VALIDITY_IN_MINUTES }).epochSeconds,
			},
		});

		try {
			await sendEmailWithMagicLink(token, email);
		} catch {
			await db.magicLink.delete({
				where: {
					id: magicLinkId,
				},
			});

			throw new ServerError(FORM_ERRORS.MAIL_SENDING_FAILED, { status: 500 });
		}

		const cookie = await createMagicIdentifierCookie(magicLinkId);

		return redirect(REDIRECTS.MAIN, {
			headers: {
				'Set-Cookie': cookie,
			},
		});
	});

	const signInErrors = createFormFieldsErrors(() => signIn.error);

	return (
		<signInTrigger.Form method="post" class="contents">
			<Input error={signInErrors()['email']} name="email" autocomplete="email">
				Email address
			</Input>
			<Checkbox name="rememberMe">Remember me</Checkbox>
			<Show when={signInErrors()['other']}>
				<p class="text-destructive text-sm">{signInErrors()['other']}</p>
			</Show>
			<p class="text-secondary text-sm">
				You don't need to create an account, just use your email address! We'll send you a link that lets you login with
				this device. No need to remember a password!
			</p>
			<Button class="max-w-48 mx-auto w-full">Sign in</Button>
		</signInTrigger.Form>
	);
};

export default SignIn;
