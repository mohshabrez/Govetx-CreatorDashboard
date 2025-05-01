import mongoose from 'mongoose';

export function createViteImportResolver(): void;
export function registerMongooseModel<T>(mongoose: typeof mongoose, modelName: string, schema: mongoose.Schema): mongoose.Model<T>;
export const reactPlugin: { name: string; transform: () => null };
export const vitePlugin: { name: string; transform: () => null }; 