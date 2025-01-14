import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { QueryClient, QueryClientProvider } from "react-query";
import AuthContextProvider from "./store/auth-context.jsx";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import App from "./App.jsx";
import { initializeIcons } from "@fluentui/font-icons-mdl2";
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			suspense: false,
			refetchOnWindowFocus: false,
		},
	},
});
initializeIcons();
ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<AuthContextProvider>
				<FluentProvider theme={webLightTheme} dir="rtl">
					<App />
				</FluentProvider>
				<ToastContainer />
			</AuthContextProvider>
		</QueryClientProvider>
	</React.StrictMode>
);
