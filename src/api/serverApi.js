import axios from "axios";
axios.defaults.headers.common["Authorization"] = `Bearer ${JSON.parse(
	localStorage.getItem("token")
)}`;
export const serverApi = axios.create({
	// baseURL: "http://3.235.213.140:8060/api/v1/",
	baseURL: "http://localhost:8060/api/v1/",
	// baseURL: "http://192.168.2.200:8050/api/v1/",
	// baseURL: "https://pixalloy.com/edt/api/v1/",
});

//Stations API
export const addStation = async (data) => {
	const res = await serverApi.post("/stations", data);
	return res;
};
export const getAllStations = async () => {
	const res = await serverApi.get("/stations");
	return res;
};
export const deleteStation = async (id) => {
	const res = await serverApi.delete(`/stations/${id}`);
	return res;
};
// export const getStation = async (data) => {
// 	const res = await serverApi.get(`/stations/${data.queryKey[1]}`);
// 	return res;
// };
// export const editStation = async (data) => {
// 	const res = await serverApi.patch(`/stations/${data.id}`, data);
// 	return res;
// };
//Income API

export const getAllIncomes = async () => {
	const res = await serverApi.get("/income");
	return res;
};
// export const addIncome = async (data) => {
// 	const res = await serverApi.post("/income", data);
// 	return res;
// };
// export const deleteIncome = async (id) => {
// 	const res = await serverApi.delete(`/income/${id}`);
// 	return res;
// };
// export const getIncome = async (data) => {
// 	const res = await serverApi.get(`/income/${data.queryKey[1]}`);
// 	return res;
// };
// export const editIncome = async (data) => {
// 	const res = await serverApi.patch(`/income/${data.id}`, data);
// 	return res;
// };
//Movments API
export const getAllMovments = async (data) => {
	const res = await serverApi.get(
		`/movments?page=${data.queryKey[1]}&limit=${data.queryKey[2]}`
	);
	return res;
};
export const getStationMovment = async (data) => {
	const res = await serverApi.get(
		`/movments/${data.queryKey[1]}/${data.queryKey[2]}`
	);
	return res;
};
export const getStationMovmentByDate = async (data) => {
	const res = await serverApi.get(
		`/movments/station/date/${data.queryKey[1]}/${data.queryKey[2]}`
	);
	return res;
};
export const getStationPendingMovment = async (data) => {
	const res = await serverApi.get(
		`/movments/pending/station/${data.queryKey[1]}`
	);
	return res;
};
export const addMovment = async (data) => {
	const res = await serverApi.post(`/movments`, data);
	return res;
};
export const addShiftMovment = async (data) => {
	const res = await serverApi.post(`/movments/shift`, data);
	return res;
};
export const deleteMovment = async (id) => {
	const res = await serverApi.delete(`/movments/${id}`);
	return res;
};
export const getMovmentData = async (data) => {
	const res = await serverApi.get(`/movments/report/${data.queryKey[1]}`);
	return res;
};

export const getShiftData = async (data) => {
	const res = await serverApi.get(
		`shifts/movment/shift/${data.queryKey[1]}/${data.queryKey[2]}`
	);
	return res;
};
export const changeMovmentState = async (data) => {
	console.log(`data`, data);
	const res = await serverApi.post(`/movments/state/${data.movment_id}`, data);
	return res;
};
//Dispensers API
export const getDispensersMovmentByMovmentIdAndShiftNumber = async (data) => {
	const res = await serverApi.get(
		`/dispensers/movments/shifts/${data.queryKey[1]}/${data.queryKey[2]}`
	);
	return res;
};
//Tanks API
export const getTanksByStationId = async (data) => {
	const res = await serverApi.get(`/tanks/station/${data.queryKey[1]}`);
	return res;
};

//Shifts API
export const getShiftsByStationId = async (data) => {
	const res = await serverApi.get(`/shifts/station/${data.queryKey[1]}`);
	return res;
};
//Stores API
export const getStoreByStationId = async (data) => {
	const res = await serverApi.get(`/stores/station/${data.queryKey[1]}`);
	return res;
};
export const getStoresMovmentByMovmentIdAndShiftNumber = async (data) => {
	const res = await serverApi.get(
		`/stores/movments/shifts/${data.queryKey[1]}/${data.queryKey[2]}`
	);
	return res;
};
//Substances API
export const addSubstance = async (data) => {
	const res = await serverApi.post("/substances", data);
	return res;
};
export const getAllSubstances = async () => {
	const res = await serverApi.get("/substances");
	return res;
};
export const deleteSubstance = async (id) => {
	const res = await serverApi.delete(`/substances/${id}`);
	return res;
};
export const getSubstance = async (data) => {
	const res = await serverApi.get(`/substances/${data.queryKey[1]}`);
	return res;
};
export const editSubstance = async (data) => {
	const res = await serverApi.patch(`/substances/${data.id}`, data);
	return res;
};

//Employees API
export const addEmployee = async (data) => {
	const res = await serverApi.post("/employees", data);
	return res;
};
export const getAllEmployees = async () => {
	const res = await serverApi.get("/employees");
	return res;
};
export const deleteEmployee = async (id) => {
	const res = await serverApi.delete(`/employees/${id}`);
	return res;
};
export const getEmployee = async (data) => {
	const res = await serverApi.get(`/employees/${data.queryKey[1]}`);
	return res;
};
export const getEmployeeByStationId = async (data) => {
	const res = await serverApi.get(`/employees/station/${data.queryKey[1]}`);
	return res;
};
export const editEmployee = async (data) => {
	const res = await serverApi.patch(`/employees/${data.id}`, data);
	return res;
};
//Users API
export const addUser = async (data) => {
	const res = await serverApi.post("/users", data);
	return res;
};
export const getAllUsers = async () => {
	const res = await serverApi.get("/users");
	return res;
};
export const getUser = async (data) => {
	const res = await serverApi.get(`/users/${data.queryKey[1]}`);
	return res;
};
export const getUsername = async (data) => {
	const res = await serverApi.get(`/users/username/${data.queryKey[1]}`);
	return res;
};
export const editUser = async (data) => {
	const res = await serverApi.patch(`/users/${data.id}`, data);
	return res;
};
export const deleteUser = async (id) => {
	const res = await serverApi.delete(`/users/${id}`);
	return res;
};
