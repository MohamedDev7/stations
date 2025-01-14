import { useContext } from "react";
import Navbar from "./components/navbar/Navbar";
import SideBar from "./components/sideBar/SideBar";
import LoginPage from "./pages/login/LoginPage";

import PropTypes from "prop-types";
import {
	createHashRouter,
	RouterProvider,
	Outlet,
	Navigate,
} from "react-router-dom";
import { AuthContext } from "./store/auth-context";
import HomePage from "./pages/home/HomePage";
import UsersPage from "./pages/users/UsersPage";
import UserFormPage from "./pages/users/UserFormPage";
import StationsPage from "./pages/stations/stationsPage";
import StationFormPage from "./pages/stations/StationFormPage";
import SubstanceFromPage from "./pages/substances/SubstanceFromPage";
import SubstancesPage from "./pages/substances/SubstancesPage";
import DailyMovments from "./pages/dailyMovment/DailyMovments";
import DailyMovmentForm from "./pages/dailyMovment/DailyMovmentForm";
// import IncomesPage from "./pages/income/IncomesPage";
// import IncomePageForm from "./pages/income/IncomePageForm";
import ShiftForm from "./pages/dailyMovment/ShiftForm";
import DailyReport from "./templates/dailyReport/DailyReport";
import ConfirmMovmentPage from "./pages/dailyMovment/ConfirmMovmentPage";
import ReportViewer from "./reports/ReportViewer";
import EditShiftForm from "./pages/dailyMovment/EditShiftForm";

function App() {
	const { currUser } = useContext(AuthContext);
	const ProtectedRoute = ({ children }) => {
		ProtectedRoute.propTypes = { children: PropTypes.any };
		if (!currUser) {
			return <Navigate to="/login" />;
		}
		return children;
	};
	const RedirectLogedinUser = ({ children }) => {
		RedirectLogedinUser.propTypes = { children: PropTypes.any };
		if (currUser) {
			return <Navigate to="/" />;
		}
		return children;
	};
	const Layout = () => {
		return (
			<div
				style={{
					display: "flex",
					backgroundColor: "#f4f6f9",
					height: "100vh",
				}}
			>
				<SideBar />

				<div
					style={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						position: "relative",
					}}
				>
					<Navbar />
					<div style={{ overflow: "auto" }}>
						<Outlet />
					</div>
				</div>
			</div>
		);
	};

	const router = createHashRouter([
		{
			path: "login",
			element: (
				<RedirectLogedinUser>
					<LoginPage />
				</RedirectLogedinUser>
			),
		},
		{
			path: "/",
			element: (
				<ProtectedRoute>
					<Layout />
				</ProtectedRoute>
			),
			children: [
				{
					path: "/",
					element: <Navigate to="/home" />,
				},
				{
					path: "home",
					element: <HomePage />,
				},
				{
					path: "substances",
					element: <Outlet />,
					children: [
						{
							path: "",
							element: <SubstancesPage />,
						},
						{
							path: "add",
							element: <SubstanceFromPage />,
						},
						{
							path: "edit",
							element: <SubstanceFromPage />,
						},
					],
				},
				{
					path: "stations",
					element: <Outlet />,
					children: [
						{
							path: "",
							element: <StationsPage />,
						},
						{
							path: "add",
							element: <StationFormPage />,
						},
						{
							path: "edit",
							element: <StationFormPage />,
						},
					],
				},
				// {
				// 	path: "income",
				// 	element: <Outlet />,
				// 	children: [
				// 		{
				// 			path: "",
				// 			element: <IncomesPage />,
				// 		},
				// 		{
				// 			path: "add",
				// 			element: <IncomePageForm />,
				// 		},
				// 		{
				// 			path: "edit",
				// 			element: <IncomePageForm />,
				// 		},
				// 	],
				// },
				{
					path: "dailyMovment",
					element: <Outlet />,
					children: [
						{
							path: "",
							element: <DailyMovments />,
						},
						{
							path: "addMovment",
							element: <DailyMovmentForm />,
						},
						{
							path: "addShift",
							element: <ShiftForm />,
						},
						{
							path: "confirm",
							element: <ConfirmMovmentPage />,
						},
						{
							path: "edit",
							element: <DailyMovmentForm />,
						},
						{
							path: "editShift",
							element: <EditShiftForm />,
						},
						{
							path: "view",
							element: <DailyReport />,
						},
						{
							path: "print",
							element: <ReportViewer />,
						},
					],
				},
				{
					path: "users",
					element: <Outlet />,
					children: [
						{
							path: "",
							element: <UsersPage />,
						},
						{
							path: "add",
							element: <UserFormPage />,
						},
						{
							path: "edit",
							element: <UserFormPage />,
						},
					],
				},
				{
					path: "test",
					element: <ReportViewer />,
				},
			],
		},
	]);
	return <RouterProvider router={router} />;
}

export default App;
