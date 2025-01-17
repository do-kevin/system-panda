export const getCollectionAlbumStub = () => {
	return {
		success: true,
		data: [
			{
				id: "1",
				title: "Album 1",
				year: 1994,
				dateCreated: new Date().toISOString(),
			},
			{ id: "2", title: "Album 2", year: 2010 },
			{ id: "3", title: "Album 3", year: 2023 },
		],
	};
};

let isFirstCall = true;

export const createCollectionAlbumStub = (data: { [key: string]: unknown }) => {
	if (isFirstCall) {
		isFirstCall = false;
		data["id"] = "4";
	} else {
		data["id"] = Math.floor(Math.random() * 999).toString();
	}

	return {
		success: true,
		data: {
			before: null,
			after: data,
		},
	};
};

export type AlbumStubResponse = ReturnType<typeof getCollectionAlbumStub>;

export const getCollectionStudentFieldsStub = () => {
	return {
		success: true,
		data: {
			fields: [
				{
					name: "name",
					type: "String",
				},
			],
		},
	};
};

export const getCollectionStudentStub = () => {
	return {
		success: true,
		data: [
			{
				id: "1",
				name: "Kevin",
				dateCreated: new Date().toDateString(),
			},
			{ id: "2", name: "Alex", dateCreated: new Date().toDateString() },
			{ id: "3", name: "Jane", dateCreated: new Date().toDateString() },
		],
	};
};

let isStudentFirstCall = true;

export const createCollectionStudentStub = (data: { [key: string]: unknown }) => {
	if (isStudentFirstCall) {
		isStudentFirstCall = false;
		data["id"] = "4";
	} else {
		data["id"] = Math.floor(Math.random() * 999).toString();
	}

	return {
		success: true,
		data: {
			before: null,
			after: data,
		},
	};
};

export const getSuccessfulItemUpdateStub = (
	itemId: string,
	changes: {
		data: {
			[key: string]: unknown;
		};
	}
) => {
	return {
		success: true,
		data: {
			before: [
				{
					id: itemId,
					title: "Placeholder",
					year: 2000,
				},
			],
			after: changes.data,
		},
	};
};

export const getSuccessfulItemDeletionStub = (itemId: string) => {
	const data = getCollectionAlbumStub().data;

	const targetIndex = data.findIndex(album => {
		return album.id === itemId;
	});

	const targetItem = data.splice(targetIndex, 1);

	return {
		success: true,
		data: {
			before: [targetItem],
			after: {},
		},
	};
};
