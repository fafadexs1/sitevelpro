import { relations } from "drizzle-orm/relations";
import { usersInAuth, clientes, plans, popups, tvChannels, tvPackageChannels, tvPackages } from "./schema";

export const clientesRelations = relations(clientes, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [clientes.userId],
		references: [usersInAuth.id]
	}),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	clientes: many(clientes),
}));

export const popupsRelations = relations(popups, ({one}) => ({
	plan: one(plans, {
		fields: [popups.planId],
		references: [plans.id]
	}),
}));

export const plansRelations = relations(plans, ({many}) => ({
	popups: many(popups),
}));

export const tvPackageChannelsRelations = relations(tvPackageChannels, ({one}) => ({
	tvChannel: one(tvChannels, {
		fields: [tvPackageChannels.channelId],
		references: [tvChannels.id]
	}),
	tvPackage: one(tvPackages, {
		fields: [tvPackageChannels.packageId],
		references: [tvPackages.id]
	}),
}));

export const tvChannelsRelations = relations(tvChannels, ({many}) => ({
	tvPackageChannels: many(tvPackageChannels),
}));

export const tvPackagesRelations = relations(tvPackages, ({many}) => ({
	tvPackageChannels: many(tvPackageChannels),
}));