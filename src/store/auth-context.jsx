import { createContext, useEffect, useState } from "react";

import PropTypes from "prop-types";
import { serverApi } from "./../api/serverApi";
export const AuthContext = createContext({
	currUser: "",
	stations: [],
	permissions: {},
	login: () => {},
	logout: () => {},
});
const AuthContextProvider = ({ children }) => {
	AuthContextProvider.propTypes = {
		children: PropTypes.any,
	};
	const [currUser, setCurrUser] = useState(
		JSON.parse(localStorage.getItem("user")) || null
	);
	const [permissions, setPermissions] = useState(
		JSON.parse(localStorage.getItem("permissions")) || null
	);
	const [stations, setStations] = useState(
		JSON.parse(localStorage.getItem("stations")) || null
	);

	useEffect(() => {
		localStorage.setItem("user", JSON.stringify(currUser));
		localStorage.setItem("permissions", JSON.stringify(permissions));
		localStorage.setItem("stations", JSON.stringify(stations));
	}, [currUser, permissions, stations]);
	const login = async (data) => {
		serverApi.defaults.withCredentials = true;
		const res = await serverApi.post(
			// "http://3.235.213.140:8060/api/v1/auth/login",
			"http://localhost:8060/api/v1/auth/login",
			// "http://192.168.2.200:8050/api/v1/auth/login",
			// "https://pixalloy.com/edt/api/v1/auth/login",
			data,
			{
				withCredentials: true,
				headers: { crossDomain: true, "Content-Type": "application/json" },
			}
		);

		localStorage.setItem("token", JSON.stringify(res.data.token));
		setCurrUser(res.data.user);
		setPermissions(res.data.permissions);
		setStations(res.data.stations);
		serverApi.defaults.headers.common["Authorization"] = `Bearer ${JSON.parse(
			localStorage.getItem("token")
		)}`;
	};
	const logout = () => {
		setCurrUser(null);
		setPermissions(null);
		setStations(null);
		localStorage.setItem("token", null);
	};
	const value = {
		currUser,
		permissions,
		stations,
		login,
		logout,
	};
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export default AuthContextProvider;