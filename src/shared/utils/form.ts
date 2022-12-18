import { type Accessor, createMemo } from 'solid-js';
import { FormError, ServerError } from 'solid-start';
import { type ZodError } from 'zod';

export type FormErrors = Record<string, string>;

export const COMMON_FORM_ERRORS = {
	BAD_REQUEST: 'Incorrect request data',
	FORM_DATA_INVALID: "Make sure you're properly submitting form and try again",
	INTERNAL_SERVER_ERROR: 'Internal server error, try again',
} as const satisfies FormErrors;

export const isFormError = (error: unknown): error is FormError => Boolean(error instanceof FormError);

export const isServerError = (error: unknown): error is ServerError => error instanceof ServerError;

export const createFormFieldsErrors = (error: Accessor<unknown>) => {
	const formFieldsErrorsMemo = createMemo(() => {
		const currentError = error();

		if (!currentError) return {};
		if (!isFormError(currentError)) {
			if (isServerError(currentError)) return { other: currentError.message };

			return { other: COMMON_FORM_ERRORS.INTERNAL_SERVER_ERROR };
		}

		if (!currentError.fieldErrors || !Object.entries(currentError.fieldErrors).length)
			return { other: currentError.message };

		return currentError.fieldErrors;
	});

	return formFieldsErrorsMemo;
};

export const zodErrorToFieldErrors = (errors: ZodError['formErrors']) => ({
	...(errors.formErrors.length ? { other: COMMON_FORM_ERRORS.FORM_DATA_INVALID } : {}),
	...Object.fromEntries(
		Object.entries(errors.fieldErrors)
			.filter(([, fieldErrors]) => typeof fieldErrors !== 'undefined')
			.map(([key, fieldErrors]) => [key, fieldErrors![0]]),
	),
});

export const convertFormDataIntoObject = (formData: FormData) =>
	Array.from(formData.entries()).reduce<Record<string, unknown>>((result, [key, value]) => {
		if (value === '') return result;

		const currentKeyValue = result[key];

		if (!currentKeyValue) {
			result[key] = value;
			return result;
		}

		if (Array.isArray(currentKeyValue)) {
			currentKeyValue.push(value);
			return result;
		}

		result[key] = [currentKeyValue, value];
		return result;
	}, {});
