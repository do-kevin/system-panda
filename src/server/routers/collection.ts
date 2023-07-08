import { NextFunction, Request, Response } from "express";
import {
	Collection,
	Context,
	EventTriggerPayload,
	Method,
	MutableProps,
	Webhook,
} from "../../util/types.js";
import { flippedCrudMapping, nullIfEmpty, SystemPandaError } from "../../util/index.js";
import { mapQuery } from "../../collection/index.js";
import { PrismaClient } from "@prisma/client";
import { webhook } from "../../webhook/index.js";

function collection(
	query: PrismaClient,
	mutableProps: MutableProps,
	ctx: Context,
	hooks: Collection["hooks"],
	models: any,
	mergedWebhooks: Webhook[],
	cKey: string,
	slugOrKey: string
) {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const inputData = req.body;
			const reqMethod = req.method as Method;
			const existingData: any = null;
			let resultData;
			const isArr = Array.isArray(inputData.data);
			const operation = flippedCrudMapping[reqMethod];
			const operationArgs = {
				existingData,
				inputData,
				operation,
				ctx,
			};

			const handleHookAndPlugin = async () => {
				for (const obj of mutableProps.plugins.active) {
					obj.fn(ctx);
				}

				for (const op of (hooks || {})[ctx.util.currentHook] || []) {
					const frozenOperationArgs = {
						...Object.freeze(Object.assign({}, operationArgs)),
						inputData: inputData.data,
						ctx: { ...ctx, customVars: ctx.customVars },
					};

					await op(frozenOperationArgs);
				}
			};

			ctx.util.currentHook = "beforeOperation";
			await handleHookAndPlugin();

			if (reqMethod === "GET") {
				const mappedQuery = mapQuery(req.query);
				resultData = await query.findMany(mappedQuery);
			} else {
				const data = await query.findMany({
					where: inputData.where,
				});

				operationArgs.existingData = nullIfEmpty(data);

				ctx.util.currentHook = "modifyInput";
				await handleHookAndPlugin();

				ctx.util.currentHook = "validateInput";
				await handleHookAndPlugin();

				let mergeData = isArr
					? inputData.data.map((x: unknown) => Object.assign({}, models[cKey], x))
					: Object.assign({}, models[cKey], inputData.data);
				mergeData = nullIfEmpty(mergeData);

				if (reqMethod === "POST") {
					await query.createMany({
						data: mergeData,
						skipDuplicates: inputData.skipDuplicates,
					});

					operationArgs.existingData = mergeData;

					resultData = {
						before: null,
						after: mergeData,
					};
				} else if (reqMethod === "PUT") {
					const updated = await query.updateMany({
						data: mergeData,
						where: inputData.where,
					});

					if (updated?.count === 0) {
						throw new SystemPandaError({
							level: "informative",
							status: 404,
							message: "No data to update.",
						});
					}

					resultData = {
						before: operationArgs.existingData,
						after: mergeData,
					};
				} else if (reqMethod === "DELETE") {
					const deleted = await query.deleteMany({
						where: inputData.where,
					});

					if (deleted?.count === 0) {
						throw new SystemPandaError({
							level: "informative",
							status: 404,
							message: "No data to delete.",
						});
					}

					resultData = {
						before: operationArgs.existingData,
						after: mergeData,
					};

					operationArgs.existingData = null;
				}
			}

			ctx.util.currentHook = "afterOperation";
			await handleHookAndPlugin();

			res.json({ success: true, data: resultData });

			const webhookTriggerPayload: EventTriggerPayload = {
				event: flippedCrudMapping[reqMethod],
				collection: {
					name: cKey,
					slug: slugOrKey,
				},
				data: nullIfEmpty(resultData) || null,
				timestamp: new Date().toISOString(),
			};

			mergedWebhooks?.forEach(obj => {
				if (obj.onOperation.includes(flippedCrudMapping[reqMethod])) {
					webhook(obj).trigger(webhookTriggerPayload);
				}
			});
		} catch (err: unknown) {
			next(err);
		}
	};
}

export { collection };