import { PrismaClient } from '@prisma/client';
import { createStableModule } from '~/lib/utils/createStableModule';

const createPrismaClient = () => {
	const instance = new PrismaClient();

	void instance.$connect();
	return instance;
};

export const db = createStableModule('db', createPrismaClient);
