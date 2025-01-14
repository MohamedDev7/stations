import React, { useEffect, useRef, useState } from "react";
import {
	SaveRegular,
	DeleteRegular,
	EditRegular,
	CheckmarkFilled,
	PrintRegular,
} from "@fluentui/react-icons";
import TopBar from "../../components/TopBar/TopBar";
import { PrimaryButton } from "@fluentui/react";
import { useNavigate } from "react-router-dom";
import {
	changeMovmentState,
	deleteMovment,
	getAllMovments,
	getMovmentData,
} from "../../api/serverApi";
import { useMutation, useQuery, useQueryClient } from "react-query";
import Card from "../../UI/card/Card";

import {
	Button,
	Dialog,
	DialogActions,
	DialogBody,
	DialogContent,
	DialogSurface,
	DialogTitle,
	DialogTrigger,
	Tooltip,
	useRestoreFocusTarget,
} from "@fluentui/react-components";
import { toast } from "react-toastify";
import { DataGrid } from "@mui/x-data-grid";
const { ipcRenderer } = window.require("electron");
const DailyMovments = () => {
	//hooks
	const navigate = useNavigate();
	const restoreFocusTargetAttribute = useRestoreFocusTarget();
	const componentRef = useRef();
	const queryClient = useQueryClient();

	//states
	const [motherboardId, setMotherboardId] = useState(null);
	const [dialog, setDialog] = useState({
		isOpened: false,
		title: "",
		content: "",
		actions: "",
	});
	const [pageState, setPageState] = useState({
		total: 0,
		page: 1,
		pageSize: 10,
	});
	const [movmentToFetch, setMovmentToFetch] = useState(null);
	//queries
	useEffect(() => {
		ipcRenderer.send("getMotherboardId");
		ipcRenderer.on("motherboardId", (event, data) => {
			console.log(`data`, data);
			setMotherboardId(data);
		});

		return () => {
			ipcRenderer.removeAllListeners("motherboardId");
		};
	}, []);
	const { data: movmentReport } = useQuery({
		queryKey: ["movmentReport", movmentToFetch?.movment_id],
		queryFn: getMovmentData,
		select: (res) => {
			console.log(`res.data`, res.data);
			const dispensers = res.data.dispensersMovment.map((el) => {
				return {
					number: el.number,
					prev_A: el.prev_A,
					curr_A: el.curr_A,
					prev_B: el.prev_B,
					curr_B: el.curr_B,
					total: el.curr_A - el.prev_A + el.curr_B - el.prev_B,
					substance_id: el.substance_id,
					substance: el.substance,
				};
			});

			const groupedDispensers = dispensers.reduce((acc, item) => {
				const existingGroup = acc.find(
					(group) => group.substance_id === item.substance_id
				);

				if (existingGroup) {
					existingGroup.data.push(item);
				} else {
					acc.push({
						title: `حركة عدادات ال${item.substance}`,
						substance_id: item.substance_id,
						data: [item],
					});
				}

				return acc;
			}, []);
			const stores = res.data.storesMovment.map((el) => {
				let totalIncome = 0;
				let totalCoupons = 0;
				console.log(`el.store_id`, el);
				const filteredIncomes = res.data.incomes.filter(
					(ele) => ele.store_id === el.store_id
				);
				const filteredSurplus = res.data.surplus.filter(
					(ele) => ele.store_id === el.store_id
				);
				const filteredCalibrations = res.data.calibrations.filter(
					(ele) => ele.store_id === el.store_id
				);
				const filteredCoupons = res.data.coupons.filter(
					(ele) => ele.store_id === el.store_id
				);
				const filteredData = [
					...filteredIncomes,
					...filteredSurplus,
					...filteredCalibrations,
				];
				console.log(`filteredData`, filteredData);
				if (filteredData.length > 0) {
					filteredData.forEach((ele) => {
						totalIncome = totalIncome + ele?.amount;
					});
				}
				if (filteredCoupons.length > 0) {
					filteredCoupons.forEach((ele) => {
						totalCoupons = totalCoupons + ele?.amount;
					});
				}

				return {
					name: el.name,
					prev_value: el.prev_value,
					curr_value: el.curr_value,
					income: totalIncome,
					total_spent: el.prev_value + totalIncome - el.curr_value,
					price: el.type === "نقدي" ? el.price : 0,
					total_value:
						el.type === "نقدي"
							? +el.price *
							  (el.prev_value + totalIncome - el.curr_value - totalCoupons)
							: 0,
					type: el.type,
					substance_id: el.substance_id,
					substance: el.substance,
					totalCoupons,
				};
			});

			const groupedStores = stores.reduce((acc, item) => {
				const existingGroup = acc.find(
					(group) => group.substance_id === item.substance_id
				);
				if (existingGroup) {
					existingGroup.data.push(item);
				} else {
					acc.push({
						title: `حركة مخازن ال${item.substance}`,
						substance_id: item.substance_id,
						data: [item],
					});
				}

				return acc;
			}, []);

			return {
				dispensers: groupedDispensers,
				info: {
					station_name: movmentToFetch.station_name,
					date: movmentToFetch.date,
					movment_number: movmentToFetch.number,
				},
				stores: groupedStores,
			};
		},
		onSuccess: (data) => {
			navigate("./print", {
				state: {
					data,
					reportTemplate: "dailyMovmentReport",
				},
			});
		},
		enabled: !!movmentToFetch?.movment_id,
	});
	const { data: movments, isLoading } = useQuery({
		queryKey: ["movments", pageState.page - 1, pageState.pageSize],
		queryFn: getAllMovments,
		select: (res) => {
			return res.data;
		},
	});
	const deleteMutation = useMutation({
		mutationFn: deleteMovment,
		onSuccess: (res) => {
			toast.success("تم الحذف بنجاح", {
				position: "top-center",
			});
			queryClient.invalidateQueries({ queryKey: ["movments"] });
			setDialog({
				isOpened: false,
				title: "",
				content: "",
				actions: "",
			});
		},
		onError: (err) => {
			toast.error(err.response.data.message, {
				position: toast.POSITION.TOP_CENTER,
			});
			setDialog({
				isOpened: false,
				title: "",
				content: "",
				actions: "",
			});
		},
	});
	const updateMovmentStateMutation = useMutation({
		mutationFn: changeMovmentState,
		onSuccess: (res) => {
			toast.success("تم فتح الحركة بنجاح", {
				position: "top-center",
			});
			queryClient.invalidateQueries([
				"movments",
				pageState.page - 1,
				pageState.pageSize,
			]);
		},
		onError: (err) => {
			toast.error(err.response.data.message, {
				position: "top-center",
			});
		},
	});
	//functions
	const checkMovment = () => {
		console.log(`pending`);
	};
	const columns = [
		{ field: "number", headerName: "رقم الحركة", width: 150 },
		{
			field: "station_name",
			headerName: "المحطة",
			width: 350,
			renderCell: (params) => {
				return params.row["station.name"];
			},
		},
		{ field: "date", headerName: "تاريخ الحركة", width: 150 },
		{
			field: "shifts",
			headerName: "المناوبات",
			width: 150,
			renderCell: (params) => {
				const shifts = [];
				for (let i = 1; i <= params.row.shifts; i++) {
					shifts.push(
						<div
							key={i}
							onClick={() => {
								if (
									params.row.insertedShifts.filter((el) => el === i - 1)
										.length === 0 &&
									i !== 1
								) {
									toast.error("لم يتم ادخال النوبة السابقة", {
										position: "top-center",
									});
									return;
								}
								if (
									params.row.insertedShifts.filter((el) => el === i).length >
										0 &&
									params.row.state !== "approved"
								) {
									navigate("./editShift", {
										state: {
											movment_id: params.row.id,
											shift_number: i,
											station_id: params.row.station_id,
											date: params.row.date,
											station_name: params.row["station.name"],
											number: params.row.number,
										},
									});
								} else if (params.row.state !== "approved") {
									navigate("./addShift", {
										state: {
											movment_id: params.row.id,
											shift_number: i,
											station_id: params.row.station_id,
											date: params.row.date,
											station_name: params.row["station.name"],
											number: params.row.number,
										},
									});
								}
							}}
							style={{
								border: "2px solid #333",
								padding: "3px 10px",
								borderRadius: "5px",
								fontWeight: "bold",
								cursor: "pointer",
								backgroundColor:
									params.row.insertedShifts.filter((el) => el === i).length > 0
										? "green"
										: "gray",
							}}
						>
							{i}
						</div>
					);
				}
				return <div style={{ display: "flex", gap: "5px" }}>{shifts}</div>;
			},
		},
		{ field: "state", headerName: "الحالة", width: 150 },
		{
			field: "actions",
			filterable: false,
			headerName: "خيارات",
			width: 250,
			renderCell: (params) => {
				return (
					<div style={{ display: "flex", gap: "10px" }}>
						<Tooltip content="تأكيد الحركة" relationship="label">
							<Button
								appearance="primary"
								icon={<CheckmarkFilled />}
								disabled={
									params.row.number.slice(-4) === "0000" ||
									params.row.state === "approved" ||
									params.row.shifts !== params.row.insertedShifts.length
										? true
										: false
								}
								size="medium"
								{...restoreFocusTargetAttribute}
								onClick={() => {
									navigate("./confirm", {
										state: {
											movment_id: params.row.id,
											station_id: params.row.station_id,
											shifts: params.row.shifts,
											date: params.row.date,
											station_name: params.row["station.name"],
											number: params.row.number,
										},
									});
								}}
							/>
						</Tooltip>
						<Tooltip content="فتح" relationship="label">
							<Button
								appearance="primary"
								icon={<EditRegular />}
								disabled={
									params.row.number.slice(-4) === "0000" ||
									params.row.state !== "approved"
										? true
										: false
								}
								size="medium"
								{...restoreFocusTargetAttribute}
								onClick={() => {
									console.log(`params.row`, params.row.station_id);
									updateMovmentStateMutation.mutate({
										state: "pending",
										movment_id: params.row.id,
										station_id: params.row.station_id,
									});
								}}
							/>
						</Tooltip>
						<Tooltip content="حذف" relationship="label">
							<Button
								style={{
									backgroundColor:
										params.row.number.slice(-4) === "0000" ||
										params.row.state === "approved"
											? true
											: "#b33c37",
								}}
								disabled={
									params.row.number.slice(-4) === "0000" ||
									params.row.state === "approved"
										? true
										: false
								}
								appearance="primary"
								icon={<DeleteRegular />}
								size="medium"
								{...restoreFocusTargetAttribute}
								onClick={() => {
									setDialog((prev) => {
										return {
											...prev,
											isOpened: true,
											title: "حذف حركة",
											content: (
												<DialogContent>
													هل أنت متأكد من حذف الحركة بتاريخ
													<span
														style={{
															fontWeight: "bold",
															fontSize: "16px",
															color: "#b33c37",
														}}
													>{` ${params.row.date} `}</span>
													للمحطة
													<span
														style={{
															fontWeight: "bold",
															fontSize: "16px",
															color: "#b33c37",
														}}
													>{` ${params.row.name} `}</span>
													؟
												</DialogContent>
											),
											actions: (
												<DialogActions>
													<DialogTrigger disableButtonEnhancement>
														<Button appearance="secondary">الغاء</Button>
													</DialogTrigger>
													<Button
														appearance="primary"
														onClick={() => {
															deleteMutation.mutate(params.id);
														}}
													>
														تأكيد
													</Button>
												</DialogActions>
											),
										};
									});
								}}
							/>
						</Tooltip>
						<Tooltip content="طباعة" relationship="label">
							<Button
								appearance="primary"
								icon={<PrintRegular />}
								disabled={params.row.state === "approved" ? false : true}
								size="medium"
								{...restoreFocusTargetAttribute}
								onClick={() => {
									setMovmentToFetch({
										movment_id: params.row.id,
										station_id: params.row.station_id,
										shifts: params.row.shifts,
										date: params.row.date,
										station_name: params.row["station.name"],
										number: params.row.number,
									});
								}}
							/>
						</Tooltip>
					</div>
				);
			},
		},
	];
	return (
		<>
			<Dialog
				open={dialog.isOpened}
				onOpenChange={(event, data) => {
					setDialog((prev) => {
						return { ...prev, isOpened: data.open };
					});
				}}
			>
				<DialogSurface>
					<DialogBody>
						<DialogTitle>{dialog.title}</DialogTitle>
						<DialogContent ref={componentRef}>{dialog.content}</DialogContent>
						<DialogActions>{dialog.actions}</DialogActions>
					</DialogBody>
				</DialogSurface>
			</Dialog>
			<TopBar
				right={
					<>
						<PrimaryButton
							appearance="primary"
							icon={<SaveRegular />}
							onClick={() => {
								navigate("./addMovment");
							}}
						>
							إضافة حركة
						</PrimaryButton>
					</>
				}
			/>
			<div
				style={{
					padding: "0 15px",
					marginTop: "10px",
					paddingBottom: "120px",
					display: "flex",
					flexDirection: "column",
					gap: "15px",
				}}
			>
				<Card title="الحركة اليومية">
					<div style={{ margin: "20px 0" }}>
						{movments && movments.movments.length > 0 ? (
							<DataGrid
								autoHeight
								rows={movments.movments}
								rowCount={movments.total}
								loading={isLoading}
								rowsPerPageOptions={[10, 30, 50, 70, 100]}
								pagination
								disableRowSelectionOnClick
								page={pageState.page - 1}
								pageSize={pageState.pageSize}
								paginationMode="server"
								onPageChange={(newPage) => {
									setPageState((old) => ({ ...old, page: newPage + 1 }));
								}}
								onPageSizeChange={(newPageSize) =>
									setPageState((old) => ({ ...old, pageSize: newPageSize }))
								}
								columns={columns}
								sx={{
									fontSize: "18px",
									outline: "none !important",
									maxWidth: "100%",
									"&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {
										outline: "none !important",
									},
									".highlight": {
										bgcolor: "rgba(255, 0, 0,.1)",
										"&:hover": {
											bgcolor: "rgba(255, 0, 0,.1)",
										},
									},
									"& .MuiDataGrid-columnHeaderTitle": {
										whiteSpace: "normal",
										lineHeight: "normal",
									},
									"& .MuiDataGrid-columnHeader": {
										// Forced to use important since overriding inline styles
										height: "unset !important",
									},
									"& .MuiDataGrid-columnHeaders": {
										// Forced to use important since overriding inline styles
										maxHeight: "168px !important",
									},
								}}
							/>
						) : (
							<div style={{ padding: "20px", textAlign: "center" }}>
								لا توجد بيانات مضافة
							</div>
						)}
					</div>
				</Card>
			</div>
		</>
	);
};

export default DailyMovments;
