// import DataLoader from "dataloader";
// import { Updoot } from "../entities/Updoot";
// import { In } from "typeorm";

// // [{postId: 5, userId: 10}]
// // then return [{postId: 5, userId: 10, value: 1}]
// export const createUpdootLoader = () => 
//   new DataLoader<{ postId: number; userId: number }, Updoot | null>(
//     async (keys) => {
//     const updoots = await Updoot.findBy({
//         userId: In(keys as any)
//     });

//     const updootIdsToUpdoot: Record<string, Updoot> = {};
//     updoots.forEach(updoot => {
//         updootIdsToUpdoot[`${updoot.userId}|${updoot.postId}`] = updoot;
//     })
//     return keys.map(
//         (key) => updootIdsToUpdoot[`${key.userId}|${key.postId}`]
//     );    
// }
// );





import DataLoader from "dataloader";
import { In } from "typeorm";
import { Updoot } from "../entities/Updoot";

// A data loader takes a list of keys (in this instance, a list of objects of keys),
// and returns a list of corresponding entities - updoots | null in the same order as the given keys.
// Data loaders batch and cache database requests to avoid the N + 1 problem of
// fetching N requests for a single db query
export const createUpdootLoader = () => new DataLoader<{userId: number, postId: number}, Updoot | null>(async (idObjArr) => {
	const userIds = idObjArr.map(obj => obj.userId)
	const postIds = idObjArr.map(obj => obj.postId)
	const updoots = await Updoot.findBy({userId: In(userIds), postId: In(postIds)})

	const updootToIdMap: Record<string, Updoot> = {}
	updoots.forEach(updoot => {
		updootToIdMap[`${updoot.postId}|${updoot.userId}`] = updoot
	})

	return idObjArr.map(obj => {
		return updootToIdMap[`${obj.postId}|${obj.userId}`];
	})
})