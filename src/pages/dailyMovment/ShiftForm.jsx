import React, { useEffect, useState } from "react";
import TopBar from "../../components/TopBar/TopBar";
import {
	DismissRegular,
	SaveRegular,
	DeleteRegular,
	EditRegular,
} from "@fluentui/react-icons";
import Card from "../../UI/card/Card";
import Row from "../../UI/row/Row";
import {
	Checkbox,
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableHeaderCell,
	TableRow,
	makeStyles,
} from "@fluentui/react-components";
import { useMutation, useQuery } from "react-query";
import {
	getShiftsByStationId,
	getStoreByStationId,
	addShiftMovment,
	getStoresMovmentByMovmentIdAndShiftNumber,
	getStationMovmentByDate,
	getDispensersMovmentByMovmentIdAndShiftNumber,
} from "../../api/serverApi";
import { useLocation, useNavigate } from "react-router-dom";
import {
	DefaultButton,
	Dropdown,
	PrimaryButton,
	TextField,
} from "@fluentui/react";
import { toast } from "react-toastify";
import TimeChange from "./../../utils/TimeChange";
import EmptyContainer from "../../components/EmptyContainer/EmptyContainer";
import { getPrevDate } from "../../utils/functions";

//styles
const useStyles = makeStyles({
	deleteBtn: {
		backgroundColor: "#dd3547",
		minWidth: "auto",
		padding: "5px 8px",
		border: "none",
		color: "white",
		":hover": { backgroundColor: "#c82333", color: "white" },
	},
	saveBtn: {
		backgroundColor: "#1c78d4",
		minWidth: "auto",
		padding: "5px 8px",
		border: "none",
		color: "white",
		":hover": { backgroundColor: "#c82333", color: "white" },
	},
	editBtn: {
		backgroundColor: "#1c78d4",

		border: "none",
		minWidth: "auto",
		padding: "5px 8px",
		color: "white",
		":hover": { backgroundColor: "#c82333", color: "white" },
	},
});
const ShiftForm = () => {
	//hooks
	const navigate = useNavigate();
	const info = useLocation();

	const styles = useStyles();
	//states
	const [prevData, setPrevData] = useState({
		movmentId: "",
		shiftNumber: "",
	});
	const [others, setOthers] = useState([]);
	const [othersCount, setOthersCount] = useState(0);
	const [incomes, setIncomes] = useState([]);
	const [incomesCount, setIncomesCount] = useState(0);
	const [coupons, setCoupons] = useState([]);
	const [couponsCount, setCouponsCount] = useState(0);
	const [storesTransfer, setStoresTransfer] = useState([]);
	const [storesTransferCount, setStoresTransferCount] = useState(0);
	const [surplus, setSurplus] = useState([]);
	const [surplusCount, setSurplusCount] = useState(0);
	const [dispensers, setDispensers] = useState([]);
	const [currStoresMovments, setCurrStoresMovments] = useState([]);
	const [calibrationIsChecked, setCalibrationIsChecked] = useState(false);
	const [incomesIsChecked, setIncomesIsChecked] = useState(false);
	const [couponsIsChecked, setCouponsIsChecked] = useState(false);
	const [storesTransferIsChecked, setStoresTransferIsChecked] = useState(false);
	const [surplusIsChecked, setSurplusIsChecked] = useState(false);
	const [othersIsChecked, setOthersIsChecked] = useState(false);
	const [calibrations, setCalibrations] = useState([]);
	const [calibrationsCount, setCalibrationsCount] = useState(0);
	const [calibrationMembers, setCalibrationMembers] = useState([]);
	const [calibrationMembersCount, setCalibrationMembersCount] = useState(0);

	//queries
	// const { data: stations } = useQuery({
	// 	queryKey: ["stations"],
	// 	queryFn: getAllStations,
	// 	select: (res) => {
	// 		return res.data.stations.map((el) => el);
	// 	},
	// });
	const { data: shifts } = useQuery({
		queryKey: ["shifts", info.state.station_id],
		queryFn: getShiftsByStationId,
		select: (res) => {
			return res.data.shifts;
		},
	});
	// const { data: currMovment } = useQuery({
	// 	queryKey: ["currMovment", station],
	// 	queryFn: getStationPendingMovment,
	// 	select: (res) => {
	// 		return res.data.pendingMovment[0];
	// 	},
	// 	enabled: !!station,
	// });
	const { refetch: refetchPrevMovment } = useQuery({
		queryKey: [
			"prevMovment",
			info.state.station_id,
			getPrevDate(info.state.date),
		],
		queryFn: getStationMovmentByDate,
		select: (res) => {
			return res.data.movment;
		},
		onSuccess: (data) => {
			setPrevData({ movmentId: data.id, shiftNumber: data.shifts });
		},
		enabled: false,
	});

	const { data: storesName } = useQuery({
		queryKey: ["stores", info.state.station_id],
		queryFn: getStoreByStationId,
		select: (res) => {
			return res.data.stores;
		},
	});
	const { data: prevStoresMovments } = useQuery({
		queryKey: ["storesMovments", prevData.movmentId, prevData.shiftNumber],
		queryFn: getStoresMovmentByMovmentIdAndShiftNumber,
		select: (res) => {
			return res.data.storesMovments.map((el) => {
				return { ...el, prev_value: el.curr_value };
			});
		},
		onSuccess: (data) => {
			setCurrStoresMovments(data);
		},
		enabled: !!prevData.movmentId && !!prevData.shiftNumber,
	});
	useQuery({
		queryKey: ["dispensers", prevData.movmentId, prevData.shiftNumber],
		queryFn: getDispensersMovmentByMovmentIdAndShiftNumber,
		select: (res) => {
			return res.data.dispensersMovments.map((el) => {
				return {
					...el,
					totalLiters: 0,
					totalValue: 0,
					prev_A: el.curr_A,
					prev_B: el.curr_B,
				};
			});
		},
		onSuccess: (data) => {
			setDispensers(data);
		},
		enabled: !!prevData.movmentId && !!prevData.shiftNumber,
	});
	const saveMutation = useMutation({
		mutationFn: addShiftMovment,
		onSuccess: (res) => {
			toast.success("تم إضافة الحركة بنجاح", {
				position: "top-center",
			});
			navigate("./..");
		},
		onError: (err) => {
			toast.error(err.response.data.message, {
				position: "top-center",
			});
		},
	});
	// const { data: employees } = useQuery({
	// 	queryKey: ["employees", station],
	// 	queryFn: getEmployeeByStationId,
	// 	select: (res) => {
	// 		return res.data.employees.map((el) => el);
	// 	},
	// 	enabled: !!station,
	// });

	//functions
	useEffect(() => {
		setPrevData({
			movmentId: "",
			shiftNumber: "",
		});

		if (info.state.shift_number === 1) {
			//قراءة مناوبات اليوم السابق

			refetchPrevMovment();
		} else {
			//قراءة مناوبات اليوم الحالي
			setPrevData({
				movmentId: info.state.movment_id,
				shiftNumber: info.state.shift_number - 1,
			});
		}
	}, [info]);
	const addCalibrationMemberHandler = () => {
		setCalibrationMembers((prev) => [
			...prev,
			{
				id: calibrationMembersCount + 1,
				name: "",
			},
		]);
		setCalibrationMembersCount((prev) => prev + 1);
	};
	const addCalibrationHandler = () => {
		setCalibrations((prev) => [
			...prev,
			{
				id: calibrationsCount + 1,
				amount: 0,
				store: null,
				substance: null,
			},
		]);
		setCalibrationsCount((prev) => prev + 1);
	};
	const addOthersHandler = () => {
		setOthers((prev) => [
			...prev,
			{
				id: othersCount + 1,
				title: "",
				store: null,
				amount: 0,
				substance: null,
				value: 0,
				saved: false,
				type: "normal",
			},
		]);
		setOthersCount((prev) => prev + 1);
	};
	const addIncomeHandler = () => {
		setIncomes((prev) => [
			...prev,
			{
				id: incomesCount + 1,
				amount: "",
				substance: null,
				store: null,
				tank: null,
				truck: "",
				driver: "",
				type: "income",
				saved: false,
			},
		]);
		setIncomesCount((prev) => prev + 1);
	};
	const addStoresTransferHandler = () => {
		setStoresTransfer((prev) => [
			...prev,
			{
				id: storesTransferCount + 1,
				amount: "",
				from_store: null,
				to_store: null,
				from_substance: null,
				to_substance: null,
				saved: false,
			},
		]);
		setStoresTransferCount((prev) => prev + 1);
	};
	const addSurplusHandler = () => {
		setSurplus((prev) => [
			...prev,
			{
				id: surplusCount + 1,
				amount: "",
				store: null,
				substance: null,
				saved: false,
			},
		]);
		setSurplusCount((prev) => prev + 1);
	};
	const addCouponsHandler = () => {
		setCoupons((prev) => [
			...prev,
			{
				id: couponsCount + 1,
				amount: "",
				store: null,
				substance: null,
				type: null,
				saved: false,
			},
		]);
		setCouponsCount((prev) => prev + 1);
	};
	const saveOtherHandler = (item) => {
		let othersTotal = 0;
		let dispensersTotal = 0;
		others
			.filter((el) => el.substance.id === item.substance.id)
			.forEach((el) => (othersTotal = othersTotal + el.amount));
		dispensers
			.filter((el) => el.dispenser.tank.substance.id === item.substance.id)
			.forEach((el) => (dispensersTotal = dispensersTotal + el.totalLiters));
		const storeToUpdate = currStoresMovments.filter(
			(el) => el.store.id === item.store
		)[0];

		if (storeToUpdate.curr_value < item.amount) {
			toast.error("لا يمكن ان يكون رصيد المخزن بالسالب", {
				position: "top-center",
			});
			return;
		}
		if (othersTotal > dispensersTotal) {
			toast.error("القيمة المدخلة أكبر من مبيعات النوبة", {
				position: "top-center",
			});
			return;
		}

		setOthers((prev) =>
			prev.filter((el) => el.id !== item.id).concat({ ...item, saved: true })
		);
	};
	const saveIncomeHandler = (income) => {
		setIncomes((prev) =>
			prev
				.filter((el) => el.id !== income.id)
				.concat({ ...income, saved: true })
		);
	};
	const saveStoresTransferHandler = (item) => {
		if (item.from_substance.id !== item.to_substance.id) {
			toast.error("لا يمكن التحويل بين المخازن لاختلاف المادة", {
				position: "top-center",
			});
			return;
		}
		if (item.from_store === item.to_store) {
			toast.error("لا يمكن  التحويل لنفس المخزن", {
				position: "top-center",
			});
			return;
		}
		if (
			+item.amount >
			currStoresMovments.filter((el) => el.store.id === item.from_store)[0]
				.curr_value
		) {
			toast.error("الكمية المدخلة أكبر من رصيد المخزن", {
				position: "top-center",
			});
			return;
		}
		setStoresTransfer((prev) =>
			prev.filter((el) => el.id !== item.id).concat({ ...item, saved: true })
		);
	};
	const saveSurplusHandler = (item) => {
		setSurplus((prev) =>
			prev.filter((el) => el.id !== item.id).concat({ ...item, saved: true })
		);
	};
	const saveCouponsHandler = (item) => {
		setCoupons((prev) =>
			prev.filter((el) => el.id !== item.id).concat({ ...item, saved: true })
		);
	};
	const updateCurrStoresMovments = () => {
		let updatedStoresMovments = [...prevStoresMovments];
		updatedStoresMovments.forEach((el) => {
			incomes.forEach((ele) => {
				if (el.store.id === ele.store) {
					el.curr_value = el.curr_value + +ele.amount;
				}
			});
		});
		updatedStoresMovments.forEach((el) => {
			surplus.forEach((ele) => {
				if (el.store.id === ele.store) {
					el.curr_value = el.curr_value + +ele.amount;
				}
			});
		});
		updatedStoresMovments.forEach((el) => {
			storesTransfer.forEach((ele) => {
				if (el.store.id === ele.to_store) {
					el.curr_value = el.curr_value + +ele.amount;
				}
				if (el.store.id === ele.from_store) {
					el.curr_value = el.curr_value - +ele.amount;
				}
			});
		});
		updatedStoresMovments.forEach((el) => {
			others.forEach((ele) => {
				if (el.store.id === ele.store) {
					el.curr_value = el.curr_value - +ele.amount;
				}
			});
		});
		updatedStoresMovments.forEach((el) => {
			calibrations.forEach((ele) => {
				if (el.store.id === ele.store) {
					el.curr_value = el.curr_value + +ele.amount;
				}
			});
		});
		const totalDispensersLitersBySubstance = {};
		dispensers.forEach((element) => {
			const substanceId = element.dispenser.tank.substance.id;
			const totalLiters = element.totalLiters;
			totalDispensersLitersBySubstance[substanceId] =
				(totalDispensersLitersBySubstance[substanceId] || 0) + totalLiters;
		});
		const totalOthersLitersBySubstance = {};
		others.forEach((element) => {
			const substanceId = element.substance.id;
			const totalLiters = element.amount;
			totalOthersLitersBySubstance[substanceId] =
				(totalOthersLitersBySubstance[substanceId] || 0) + totalLiters;
		});
		updatedStoresMovments.forEach((el) => {
			if (el.store.type === "نقدي") {
				const totalDispensersLiters =
					totalDispensersLitersBySubstance[el.store.substance.id] || 0;
				const totalOthersLiters =
					totalOthersLitersBySubstance[el.store.substance.id] || 0;
				let totalIncomes = 0;
				incomes
					.filter((ele) => ele.store === el.store.id)
					.forEach((ele) => (totalIncomes = totalIncomes + +ele.amount));
				console.log(`totalIncomes`, totalIncomes);
				el.curr_value =
					el.curr_value - totalDispensersLiters + totalOthersLiters;
				el.price = el.store.substance.price;
				el.totalIncomes = totalIncomes;
			} else {
				el.price = 0;
			}
		});
		console.log(`updatedStoresMovments`, updatedStoresMovments);
		setCurrStoresMovments(updatedStoresMovments);
	};
	useEffect(() => {
		if (
			others.filter((el) => !el.saved).length === 0 &&
			incomes.filter((el) => !el.saved).length === 0 &&
			storesTransfer.filter((el) => !el.saved).length === 0 &&
			surplus.filter((el) => !el.saved).length === 0 &&
			prevStoresMovments
		) {
			updateCurrStoresMovments();
		}
	}, [others, incomes, dispensers, calibrations, storesTransfer, surplus]);
	const onSaveMovmentHandler = () => {
		saveMutation.mutate({
			dispensers,
			station_id: info.state.station_id,
			movment_id: info.state.movment_id,
			shift: shifts.filter((el) => el.number === info.state.shift_number)[0],
			date: info.state.date,
			others,
			incomes,
			currStoresMovments,
			calibrations,
			calibrationMembers,
			surplus,
			storesTransfer,
			coupons,
		});
	};
	const test = () => {
		console.log(`coupons`, coupons);
	};
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSaveMovmentHandler();
			}}
		>
			<TopBar
				right={
					<>
						<DefaultButton
							appearance="secondary"
							icon={<DismissRegular />}
							onClick={() => {
								navigate("./..");
							}}
						>
							الغاء
						</DefaultButton>
						<PrimaryButton
							appearance="primary"
							icon={<SaveRegular />}
							type="submit"
						>
							حفظ
						</PrimaryButton>
						<button onClick={test} type="button">
							test
						</button>
					</>
				}
			/>
			<div
				style={{
					padding: "0 5px",
					marginTop: "10px",
					paddingBottom: "120px",
					display: "flex",
					flexDirection: "column",
					gap: "15px",
				}}
			>
				{shifts && (
					<Card title="بيانات النوبة">
						<Row flex={[3, 2, 2, 2]}>
							<TextField
								label="اسم المحطة"
								value={info.state.station_name}
								// disabled
								readOnly
							/>
							<TextField
								label="رقم الحركة"
								value={info.state.number}
								// disabled
								readOnly
							/>
							<TextField
								label="المناوبة"
								value={`${
									shifts.filter(
										(el) => el.number === info.state.shift_number
									)[0].number
								}- من ${TimeChange(
									shifts.filter(
										(el) => el.number === info.state.shift_number
									)[0].start
								)} الى ${TimeChange(
									shifts.filter(
										(el) => el.number === info.state.shift_number
									)[0].end
								)}`}
								readOnly
							/>

							<></>
						</Row>
						<div>
							<Checkbox
								label="وارد"
								checked={incomesIsChecked}
								onChange={() => {
									setIncomes([]);
									setIncomesCount(0);
									setIncomesIsChecked((prev) => !prev);
								}}
							/>

							<Checkbox
								label="تحويل مخزني"
								checked={storesTransferIsChecked}
								onChange={() => {
									setStoresTransfer([]);
									setStoresTransferCount(0);
									setStoresTransferIsChecked((prev) => !prev);
								}}
							/>
							<Checkbox
								label="فائض"
								checked={surplusIsChecked}
								onChange={() => {
									setSurplus([]);
									setSurplusCount(0);
									setSurplusIsChecked((prev) => !prev);
								}}
							/>
							<Checkbox
								label="معايرة"
								checked={calibrationIsChecked}
								onChange={() => {
									setCalibrations([]);
									setCalibrationsCount(0);
									setCalibrationIsChecked((prev) => !prev);
								}}
							/>
							<Checkbox
								label="مسحوبات الفرع"
								checked={couponsIsChecked}
								onChange={() => {
									setCoupons([]);
									setCouponsCount(0);
									setCouponsIsChecked((prev) => !prev);
								}}
							/>
							<Checkbox
								label="مسحوبات اخرى"
								checked={othersIsChecked}
								onChange={() => {
									setOthers([]);
									setOthersCount(0);
									setOthersIsChecked((prev) => !prev);
								}}
							/>
						</div>
					</Card>
				)}
				{incomesIsChecked && (
					<Card title="الواردات">
						{incomes.length > 0 ? (
							<Table arial-label="Default table">
								<TableHeader>
									<TableRow>
										<TableHeaderCell>الكمية</TableHeaderCell>
										<TableHeaderCell>المستودع</TableHeaderCell>
										{/* <TableHeaderCell>الخزان</TableHeaderCell> */}
										<TableHeaderCell>الناقلة</TableHeaderCell>
										<TableHeaderCell>السائق</TableHeaderCell>
									</TableRow>
								</TableHeader>
								<TableBody>
									{incomes.map((income, i) => (
										<TableRow key={i}>
											<TableCell>
												<TextField
													value={
														incomes.filter((el) => el.id === income.id)[0]
															.amount
													}
													onFocus={(e) => e.target.select()}
													onWheel={(e) => e.target.blur()}
													onKeyDown={(e) => {
														if (e.key === "ArrowUp" || e.key === "ArrowDown") {
															e.preventDefault();
														}
													}}
													onChange={(e) => {
														const updated = incomes.map((el) => {
															if (el.id === income.id) {
																return {
																	...el,
																	amount: e.target.value,
																};
															}
															return el;
														});
														setIncomes(updated);
													}}
													type="number"
												/>
											</TableCell>
											<TableCell>
												<Dropdown
													required
													onChange={(_, selection) => {
														const updated = incomes.map((el) => {
															if (el.id === income.id) {
																return {
																	...el,
																	store: selection.key,
																	substance: storesName.filter(
																		(el) => el.id === selection.key
																	)[0].substance,
																};
															}
															return el;
														});
														setIncomes(updated);
													}}
													options={
														storesName &&
														storesName.map((el) => {
															return {
																key: el.id,
																text: `${el.name} - ${el.substance.name}`,
															};
														})
													}
												/>
											</TableCell>
											{/* <TableCell>{income.tanck}</TableCell> */}
											<TableCell>
												<TextField
													value={income.truck}
													onFocus={(e) => e.target.select()}
													onWheel={(e) => e.target.blur()}
													onKeyDown={(e) => {
														if (e.key === "ArrowUp" || e.key === "ArrowDown") {
															e.preventDefault();
														}
													}}
													onChange={(e) => {
														const updated = incomes.map((el) => {
															if (el.id === income.id) {
																return {
																	...el,
																	truck: e.target.value,
																};
															}
															return el;
														});
														setIncomes(updated);
													}}
												/>
											</TableCell>
											<TableCell>
												<TextField
													value={income.driver}
													onFocus={(e) => e.target.select()}
													onWheel={(e) => e.target.blur()}
													onKeyDown={(e) => {
														if (e.key === "ArrowUp" || e.key === "ArrowDown") {
															e.preventDefault();
														}
													}}
													onChange={(e) => {
														const updated = incomes.map((el) => {
															if (el.id === income.id) {
																return {
																	...el,
																	driver: e.target.value,
																};
															}
															return el;
														});
														setIncomes(updated);
													}}
												/>
											</TableCell>
											<TableCell>
												<div style={{ display: "flex", gap: "5px" }}>
													<DefaultButton
														className={styles.saveBtn}
														onClick={() => saveIncomeHandler(income)}
													>
														<SaveRegular style={{ fontSize: "22px" }} />
													</DefaultButton>
													<DefaultButton
														className={styles.editBtn}
														disabled={!income.saved}
														onClick={() =>
															setIncomes((prev) =>
																prev.filter((el) => el.id !== income.id)
															)
														}
													>
														<EditRegular style={{ fontSize: "22px" }} />
													</DefaultButton>
													<DefaultButton
														className={styles.deleteBtn}
														onClick={() =>
															setIncomes((prev) =>
																prev.filter((el) => el.id !== income.id)
															)
														}
													>
														<DeleteRegular style={{ fontSize: "22px" }} />
													</DefaultButton>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : (
							<EmptyContainer msg="لا توجد بيانات" />
						)}
						<Row>
							<PrimaryButton
								appearance="primary"
								onClick={() => addIncomeHandler()}
								disabled={incomes.filter((el) => el.saved === false).length > 0}
							>
								إضافة وارد
							</PrimaryButton>
						</Row>
					</Card>
				)}

				{storesTransferIsChecked && (
					<Card title="تحويل مخزني">
						{storesTransfer.length > 0 ? (
							<Table arial-label="Default table">
								<TableHeader>
									<TableRow>
										<TableHeaderCell>من</TableHeaderCell>
										<TableHeaderCell>إلى</TableHeaderCell>
										{/* <TableHeaderCell>الخزان</TableHeaderCell> */}
										<TableHeaderCell>الكمية</TableHeaderCell>
									</TableRow>
								</TableHeader>
								<TableBody>
									{storesTransfer.map((item, i) => (
										<TableRow key={i}>
											<TableCell>
												<Dropdown
													required
													onChange={(_, selection) => {
														const updated = storesTransfer.map((el) => {
															if (el.id === item.id) {
																return {
																	...el,
																	from_store: selection.key,
																	from_substance: storesName.filter(
																		(el) => el.id === selection.key
																	)[0].substance,
																};
															}
															return el;
														});
														setStoresTransfer(updated);
													}}
													options={
														storesName &&
														storesName.map((el) => {
															return {
																key: el.id,
																text: `${el.name} - ${el.substance.name}`,
															};
														})
													}
												/>
											</TableCell>
											<TableCell>
												<Dropdown
													required
													onChange={(_, selection) => {
														const updated = storesTransfer.map((el) => {
															if (el.id === item.id) {
																return {
																	...el,
																	to_store: selection.key,
																	to_substance: storesName.filter(
																		(el) => el.id === selection.key
																	)[0].substance,
																};
															}
															return el;
														});
														setStoresTransfer(updated);
													}}
													options={
														storesName &&
														storesName.map((el) => {
															return {
																key: el.id,
																text: `${el.name} - ${el.substance.name}`,
															};
														})
													}
												/>
											</TableCell>
											<TableCell>
												<TextField
													value={
														storesTransfer.filter((el) => el.id === item.id)[0]
															.amount
													}
													onFocus={(e) => e.target.select()}
													onWheel={(e) => e.target.blur()}
													onKeyDown={(e) => {
														if (e.key === "ArrowUp" || e.key === "ArrowDown") {
															e.preventDefault();
														}
													}}
													onChange={(e) => {
														const updated = storesTransfer.map((el) => {
															if (el.id === item.id) {
																return {
																	...el,
																	amount: e.target.value,
																};
															}
															return el;
														});
														setStoresTransfer(updated);
													}}
													type="number"
												/>
											</TableCell>
											<TableCell>
												<div style={{ display: "flex", gap: "5px" }}>
													<DefaultButton
														className={styles.saveBtn}
														onClick={() => saveStoresTransferHandler(item)}
													>
														<SaveRegular style={{ fontSize: "22px" }} />
													</DefaultButton>
													<DefaultButton
														className={styles.editBtn}
														disabled={!item.saved}
														onClick={() =>
															setStoresTransfer((prev) =>
																prev.filter((el) => el.id !== item.id)
															)
														}
													>
														<EditRegular style={{ fontSize: "22px" }} />
													</DefaultButton>
													<DefaultButton
														className={styles.deleteBtn}
														onClick={() =>
															setStoresTransfer((prev) =>
																prev.filter((el) => el.id !== item.id)
															)
														}
													>
														<DeleteRegular style={{ fontSize: "22px" }} />
													</DefaultButton>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : (
							<EmptyContainer msg="لا توجد بيانات" />
						)}
						<Row>
							<PrimaryButton
								appearance="primary"
								onClick={() => addStoresTransferHandler()}
								disabled={
									storesTransfer.filter((el) => el.saved === false).length > 0
								}
							>
								إضافة تحويل مخزني
							</PrimaryButton>
						</Row>
					</Card>
				)}
				{surplusIsChecked && (
					<Card title="الفائض">
						{surplus.length > 0 ? (
							<Table arial-label="Default table">
								<TableHeader>
									<TableRow>
										<TableHeaderCell>الكمية</TableHeaderCell>
										<TableHeaderCell>المستودع</TableHeaderCell>
									</TableRow>
								</TableHeader>
								<TableBody>
									{surplus.map((item, i) => (
										<TableRow key={i}>
											<TableCell>
												<TextField
													value={
														surplus.filter((el) => el.id === item.id)[0].amount
													}
													onFocus={(e) => e.target.select()}
													onWheel={(e) => e.target.blur()}
													onKeyDown={(e) => {
														if (e.key === "ArrowUp" || e.key === "ArrowDown") {
															e.preventDefault();
														}
													}}
													onChange={(e) => {
														const updated = surplus.map((el) => {
															if (el.id === item.id) {
																return {
																	...el,
																	amount: e.target.value,
																};
															}
															return el;
														});
														setSurplus(updated);
													}}
													type="number"
												/>
											</TableCell>
											<TableCell>
												<Dropdown
													required
													onChange={(_, selection) => {
														const updated = surplus.map((el) => {
															if (el.id === item.id) {
																return {
																	...el,
																	store: selection.key,
																	substance: storesName.filter(
																		(el) => el.id === selection.key
																	)[0].substance,
																};
															}
															return el;
														});
														setSurplus(updated);
													}}
													options={
														storesName &&
														storesName.map((el) => {
															return {
																key: el.id,
																text: `${el.name} - ${el.substance.name}`,
															};
														})
													}
												/>
											</TableCell>

											<TableCell>
												<div style={{ display: "flex", gap: "5px" }}>
													<DefaultButton
														className={styles.saveBtn}
														onClick={() => saveSurplusHandler(item)}
													>
														<SaveRegular style={{ fontSize: "22px" }} />
													</DefaultButton>
													<DefaultButton
														className={styles.editBtn}
														disabled={!item.saved}
														onClick={() =>
															setSurplus((prev) =>
																prev.filter((el) => el.id !== item.id)
															)
														}
													>
														<EditRegular style={{ fontSize: "22px" }} />
													</DefaultButton>
													<DefaultButton
														className={styles.deleteBtn}
														onClick={() =>
															setSurplus((prev) =>
																prev.filter((el) => el.id !== item.id)
															)
														}
													>
														<DeleteRegular style={{ fontSize: "22px" }} />
													</DefaultButton>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : (
							<EmptyContainer msg="لا توجد بيانات" />
						)}
						<Row>
							<PrimaryButton
								appearance="primary"
								onClick={() => addSurplusHandler()}
								disabled={surplus.filter((el) => el.saved === false).length > 0}
							>
								إضافة فائض
							</PrimaryButton>
						</Row>
					</Card>
				)}

				{calibrationIsChecked && (
					<Card title="معايرة">
						<h3
							style={{
								textDecoration: "underline",
								fontWeight: "bold",
								fontSize: "18px",
							}}
						>
							كميات المعايرة
						</h3>
						{calibrations.length > 0 ? (
							<Table arial-label="Default table">
								<TableHeader>
									<TableRow>
										<TableHeaderCell>كمية المعايرة</TableHeaderCell>
										<TableHeaderCell>المادة</TableHeaderCell>
									</TableRow>
								</TableHeader>
								<TableBody>
									{calibrations.map((calibration, i) => (
										<TableRow key={i}>
											<TableCell>
												<TextField
													value={
														calibrations.filter(
															(el) => el.id === calibration.id
														)[0].amount
													}
													onFocus={(e) => e.target.select()}
													onWheel={(e) => e.target.blur()}
													onKeyDown={(e) => {
														if (e.key === "ArrowUp" || e.key === "ArrowDown") {
															e.preventDefault();
														}
													}}
													onChange={(e) => {
														const updated = calibrations.map((el) => {
															if (el.id === calibration.id) {
																return {
																	...el,
																	amount: e.target.value,
																};
															}
															return el;
														});
														setCalibrations(updated);
													}}
												/>
											</TableCell>
											<TableCell>
												<Dropdown
													required
													onChange={(_, selection) => {
														const updated = calibrations.map((el) => {
															if (el.id === calibration.id) {
																return {
																	...el,
																	store: selection.key,
																	substance: storesName.filter(
																		(el) => el.id === selection.key
																	)[0].substance,
																};
															}
															return el;
														});
														setCalibrations(updated);
													}}
													options={
														storesName &&
														storesName.map((el) => {
															return {
																key: el.id,
																text: `${el.name} - ${el.substance.name}`,
															};
														})
													}
												/>
											</TableCell>
											<TableCell>
												<div style={{ display: "flex", gap: "5px" }}>
													<DefaultButton
														className={styles.deleteBtn}
														onClick={() =>
															setCalibrations((prev) =>
																prev.filter((el) => el.id !== calibration.id)
															)
														}
													>
														<DeleteRegular style={{ fontSize: "22px" }} />
													</DefaultButton>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : (
							<EmptyContainer msg="لا توجد بيانات" />
						)}
						<Row>
							<PrimaryButton
								appearance="primary"
								onClick={() => addCalibrationHandler()}
							>
								إضافة كمية
							</PrimaryButton>
						</Row>
						<h3
							style={{
								textDecoration: "underline",
								fontWeight: "bold",
								fontSize: "18px",
								marginTop: "20px",
							}}
						>
							اعضاء لجنة المعايرة
						</h3>
						{calibrationMembers.length > 0 ? (
							<Table arial-label="Default table">
								<TableHeader>
									<TableRow>
										<TableHeaderCell>اعضاء لجنة المعايرة</TableHeaderCell>
									</TableRow>
								</TableHeader>
								<TableBody>
									{calibrationMembers.map((member, i) => (
										<TableRow key={i}>
											<TableCell>
												<TextField
													value={
														calibrationMembers.filter(
															(el) => el.id === member.id
														)[0].name
													}
													onFocus={(e) => e.target.select()}
													onWheel={(e) => e.target.blur()}
													onKeyDown={(e) => {
														if (e.key === "ArrowUp" || e.key === "ArrowDown") {
															e.preventDefault();
														}
													}}
													onChange={(e) => {
														const updated = calibrationMembers.map((el) => {
															if (el.id === member.id) {
																return {
																	...el,
																	name: e.target.value,
																};
															}
															return el;
														});
														setCalibrationMembers(updated);
													}}
												/>
											</TableCell>
											<TableCell>
												<div style={{ display: "flex", gap: "5px" }}>
													<DefaultButton
														className={styles.deleteBtn}
														onClick={() =>
															setCalibrationMembers((prev) =>
																prev.filter((el) => el.id !== member.id)
															)
														}
													>
														<DeleteRegular style={{ fontSize: "22px" }} />
													</DefaultButton>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : (
							<EmptyContainer msg="لا توجد بيانات" />
						)}
						<Row>
							<PrimaryButton
								appearance="primary"
								onClick={() => addCalibrationMemberHandler()}
							>
								إضافة عضو
							</PrimaryButton>
						</Row>
					</Card>
				)}
				<Card title="خلاصة الحركة">
					<Table arial-label="Default table">
						<TableHeader>
							<TableRow>
								<TableHeaderCell>المخزن</TableHeaderCell>
								<TableHeaderCell>الرصيد السابق</TableHeaderCell>
								<TableHeaderCell>مسحوبات الفرع</TableHeaderCell>
								<TableHeaderCell>الوارد</TableHeaderCell>
								<TableHeaderCell>المنصرف</TableHeaderCell>
								<TableHeaderCell>الرصيد الحالي</TableHeaderCell>
								<TableHeaderCell>المبيعات النقدية</TableHeaderCell>
							</TableRow>
						</TableHeader>
						<TableBody>
							{currStoresMovments &&
								currStoresMovments.map((item, i) => (
									<TableRow key={i}>
										<TableCell>{`${item.store.name} - ${item.store.substance.name}`}</TableCell>
										<TableCell>{item.prev_value}</TableCell>
										<TableCell>{item.curr_value}</TableCell>
										<TableCell>
											{item.curr_value - item.prev_value > 0
												? `+${item.curr_value - item.prev_value}`
												: item.curr_value - item.prev_value}
										</TableCell>
										<TableCell>
											{(item.prev_value - item.curr_value + item.totalIncomes
												? item.totalIncomes
												: 0) * item.price}
										</TableCell>
									</TableRow>
								))}
						</TableBody>
					</Table>
				</Card>
				{dispensers && dispensers.length > 0 && (
					<Card title="حركة العدادات">
						<Table arial-label="Default table">
							<TableHeader>
								<TableRow>
									<TableHeaderCell rowSpan={2}>بيانات الطرمبة</TableHeaderCell>
									<TableHeaderCell colSpan={2}>أ</TableHeaderCell>
									<TableHeaderCell colSpan={2}>ب</TableHeaderCell>
									<TableHeaderCell rowSpan={2}>
										اجمالي الحركة(لتر)
									</TableHeaderCell>
								</TableRow>
								<TableRow>
									<TableHeaderCell>بداية المناوبة</TableHeaderCell>
									<TableHeaderCell>نهاية المناوبة</TableHeaderCell>
									<TableHeaderCell>بداية المناوبة</TableHeaderCell>
									<TableHeaderCell>نهاية المناوبة</TableHeaderCell>

									{/* <TableHeaderCell>القيمة(ريال)</TableHeaderCell> */}
								</TableRow>
							</TableHeader>
							<TableBody>
								{dispensers.map((dispenser) => (
									<TableRow key={dispenser.id}>
										<TableCell>
											<TextField
												value={`${
													dispensers.filter((el) => el.id === dispenser.id)[0]
														.dispenser.number
												}-${
													dispensers.filter((el) => el.id === dispenser.id)[0]
														.dispenser.tank.substance.name
												}`}
												readOnly
												disabled
											/>
										</TableCell>
										<TableCell>
											<TextField
												value={
													dispensers.filter((el) => el.id === dispenser.id)[0]
														.prev_A
												}
												onFocus={(e) => e.target.select()}
												onWheel={(e) => e.target.blur()}
												onKeyDown={(e) => {
													if (e.key === "ArrowUp" || e.key === "ArrowDown") {
														e.preventDefault();
													}
												}}
												readOnly
												disabled
												type="number"
											/>
										</TableCell>
										<TableCell>
											<TextField
												value={
													dispensers.filter((el) => el.id === dispenser.id)[0]
														.curr_A
												}
												onGetErrorMessage={(value) => {
													return value >= dispenser.prev_A
														? ""
														: `يجب ان تكون القيمة اكبر من او يساوي  ${dispenser.prev_A}.`;
												}}
												validateOnFocusOut
												onChange={(e) => {
													e.stopPropagation();
													const updatedDispensers = dispensers.map((el) => {
														if (el.id === dispenser.id) {
															return {
																...el,
																curr_A: +e.target.value,
																totalLiters:
																	+e.target.value -
																	dispenser.prev_A +
																	(dispenser.curr_B - dispenser.prev_B),
																totalValue:
																	(+e.target.value -
																		dispenser.prev_A +
																		(dispenser.curr_B - dispenser.prev_B)) *
																	dispenser.price,
															};
														}
														return el;
													});

													setDispensers(updatedDispensers);
												}}
												onFocus={(e) => e.target.select()}
												onWheel={(e) => e.target.blur()}
												onKeyDown={(e) => {
													if (e.key === "ArrowUp" || e.key === "ArrowDown") {
														e.preventDefault();
													}
												}}
												type="number"
												min={dispenser.prev_A}
											/>
										</TableCell>
										<TableCell>
											<TextField
												value={
													dispensers.filter((el) => el.id === dispenser.id)[0]
														.prev_B
												}
												onFocus={(e) => e.target.select()}
												onWheel={(e) => e.target.blur()}
												onKeyDown={(e) => {
													if (e.key === "ArrowUp" || e.key === "ArrowDown") {
														e.preventDefault();
													}
												}}
												readOnly
												disabled
												type="number"
											/>
										</TableCell>
										<TableCell>
											<TextField
												value={
													dispensers.filter((el) => el.id === dispenser.id)[0]
														.curr_B
												}
												onGetErrorMessage={(value) => {
													return value >= dispenser.prev_B
														? ""
														: `يجب ان تكون القيمة اكبر من او يساوي  ${dispenser.prev_B}.`;
												}}
												validateOnFocusOut
												onChange={(e) => {
													e.stopPropagation();

													const updatedDispensers = dispensers.map((el) => {
														if (el.id === dispenser.id) {
															return {
																...el,
																curr_B: +e.target.value,
																totalLiters:
																	+e.target.value -
																	dispenser.prev_B +
																	(dispenser.curr_A - dispenser.prev_A),
																totalValue:
																	(+e.target.value -
																		dispenser.prev_B +
																		(dispenser.curr_A - dispenser.prev_A)) *
																	dispenser.price,
															};
														}
														return el;
													});

													setDispensers(updatedDispensers);
												}}
												onFocus={(e) => e.target.select()}
												onWheel={(e) => e.target.blur()}
												onKeyDown={(e) => {
													if (e.key === "ArrowUp" || e.key === "ArrowDown") {
														e.preventDefault();
													}
												}}
												type="number"
												min={dispenser.prev_B}
											/>
										</TableCell>
										<TableCell>
											<TextField
												disabled
												readOnly
												value={dispenser.totalLiters}
											/>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</Card>
				)}
				{couponsIsChecked && (
					<Card title="مسحوبات الفرع">
						{coupons.length > 0 ? (
							<Table arial-label="Default table">
								<TableHeader>
									<TableRow>
										<TableHeaderCell>الكمية</TableHeaderCell>
										<TableHeaderCell>المستودع</TableHeaderCell>
										<TableHeaderCell>النوع</TableHeaderCell>
									</TableRow>
								</TableHeader>
								<TableBody>
									{coupons.map((item, i) => (
										<TableRow key={i}>
											<TableCell>
												<TextField
													value={
														coupons.filter((el) => el.id === item.id)[0].amount
													}
													onFocus={(e) => e.target.select()}
													onWheel={(e) => e.target.blur()}
													onKeyDown={(e) => {
														if (e.key === "ArrowUp" || e.key === "ArrowDown") {
															e.preventDefault();
														}
													}}
													onChange={(e) => {
														const updated = coupons.map((el) => {
															if (el.id === item.id) {
																return {
																	...el,
																	amount: e.target.value,
																};
															}
															return el;
														});
														setCoupons(updated);
													}}
													type="number"
												/>
											</TableCell>
											<TableCell>
												<Dropdown
													required
													onChange={(_, selection) => {
														const updated = coupons.map((el) => {
															if (el.id === item.id) {
																return {
																	...el,
																	store: selection.key,
																	substance: storesName.filter(
																		(el) => el.id === selection.key
																	)[0].substance,
																};
															}
															return el;
														});
														setCoupons(updated);
													}}
													options={
														storesName &&
														storesName.map((el) => {
															return {
																key: el.id,
																text: `${el.name} - ${el.substance.name}`,
															};
														})
													}
												/>
											</TableCell>
											<TableCell>
												<Dropdown
													required
													onChange={(_, selection) => {
														const updated = coupons.map((el) => {
															if (el.id === item.id) {
																return {
																	...el,
																	type: selection.text,
																};
															}
															return el;
														});
														setCoupons(updated);
													}}
													options={[
														{
															key: 1,
															text: "كوبونات",
														},
														{
															key: 2,
															text: "اخرى",
														},
													]}
												/>
											</TableCell>
											<TableCell>
												<div style={{ display: "flex", gap: "5px" }}>
													<DefaultButton
														className={styles.saveBtn}
														onClick={() => saveCouponsHandler(item)}
													>
														<SaveRegular style={{ fontSize: "22px" }} />
													</DefaultButton>
													<DefaultButton
														className={styles.editBtn}
														disabled={!item.saved}
														onClick={() =>
															setCoupons((prev) =>
																prev.filter((el) => el.id !== item.id)
															)
														}
													>
														<EditRegular style={{ fontSize: "22px" }} />
													</DefaultButton>
													<DefaultButton
														className={styles.deleteBtn}
														onClick={() =>
															setCoupons((prev) =>
																prev.filter((el) => el.id !== item.id)
															)
														}
													>
														<DeleteRegular style={{ fontSize: "22px" }} />
													</DefaultButton>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : (
							<EmptyContainer msg="لا توجد بيانات" />
						)}
						<Row>
							<PrimaryButton
								appearance="primary"
								onClick={() => addCouponsHandler()}
								disabled={coupons.filter((el) => el.saved === false).length > 0}
							>
								إضافة
							</PrimaryButton>
						</Row>
					</Card>
				)}
				{othersIsChecked && (
					<Card title="مسحوبات اخرى">
						{others.length > 0 ? (
							<Table arial-label="Default table">
								<TableHeader>
									<TableRow>
										<TableHeaderCell>المخزن</TableHeaderCell>
										<TableHeaderCell>البيان</TableHeaderCell>
										<TableHeaderCell>الكمية</TableHeaderCell>
										<TableHeaderCell>اجمالي المبلغ</TableHeaderCell>
										<TableHeaderCell></TableHeaderCell>
									</TableRow>
								</TableHeader>
								<TableBody>
									{others.map((item) => (
										<TableRow key={item.id}>
											<TableCell>
												<Dropdown
													required
													onChange={(_, selection) => {
														const updated = others.map((el) => {
															if (el.id === item.id) {
																return {
																	...el,
																	store: selection.key,
																	substance: storesName.filter(
																		(el) => el.id === selection.key
																	)[0].substance,
																};
															}
															return el;
														});
														setOthers(updated);
													}}
													options={
														storesName &&
														storesName
															.filter((el) => el.name !== "شركة")
															.map((el) => {
																return {
																	key: el.id,
																	text: `${el.name} - ${el.substance.name}`,
																};
															})
													}
													disabled={item.saved}
												/>
											</TableCell>
											<TableCell>
												<TextField
													value={
														others.filter((el) => el.id === item.id)[0].title
													}
													disabled={item.saved}
													onChange={(e) => {
														e.stopPropagation();
														const updated = others.map((el) => {
															if (el.id === item.id) {
																return {
																	...el,
																	title: e.target.value,
																};
															}
															return el;
														});
														setOthers(updated);
													}}
													onFocus={(e) => e.target.select()}
													onWheel={(e) => e.target.blur()}
													onKeyDown={(e) => {
														if (e.key === "ArrowUp" || e.key === "ArrowDown") {
															e.preventDefault();
														}
													}}
												/>
											</TableCell>
											<TableCell>
												<TextField
													value={
														others.filter((el) => el.id === item.id)[0].amount
													}
													disabled={item.saved}
													onChange={(e) => {
														const updated = others.map((other) => {
															if (other.id === item.id) {
																return {
																	...other,
																	amount: +e.target.value,
																	value: item.substance.price
																		? item.substance.price * +e.target.value
																		: 0,
																};
															} else {
																return other;
															}
														});
														setOthers(updated);
													}}
													// onFocus={(e) => e.target.select()}
													onWheel={(e) => e.target.blur()}
													onKeyDown={(e) => {
														if (e.key === "ArrowUp" || e.key === "ArrowDown") {
															e.preventDefault();
														}
													}}
													type="number"
													min="1"
												/>
											</TableCell>
											<TableCell>
												<TextField
													value={
														others.filter((el) => el.id === item.id)[0].value
													}
													type="number"
													disabled
													readOnly
												/>
											</TableCell>
											<TableCell>
												<div style={{ display: "flex", gap: "5px" }}>
													<DefaultButton
														className={styles.saveBtn}
														onClick={() => saveOtherHandler(item)}
													>
														<SaveRegular style={{ fontSize: "22px" }} />
													</DefaultButton>
													<DefaultButton
														className={styles.editBtn}
														disabled={!item.saved}
														onClick={() =>
															setOthers((prev) =>
																prev.filter((el) => el.id !== item.id)
															)
														}
													>
														<EditRegular style={{ fontSize: "22px" }} />
													</DefaultButton>
													<DefaultButton
														className={styles.deleteBtn}
														onClick={() =>
															setOthers((prev) =>
																prev.filter((el) => el.id !== item.id)
															)
														}
													>
														<DeleteRegular style={{ fontSize: "22px" }} />
													</DefaultButton>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : (
							<EmptyContainer msg="لا توجد بيانات" />
						)}
						<Row>
							<PrimaryButton
								appearance="primary"
								onClick={() => addOthersHandler()}
								disabled={others.filter((el) => el.saved === false).length > 0}
							>
								إضافة
							</PrimaryButton>
						</Row>
					</Card>
				)}
			</div>
		</form>
	);
};

export default ShiftForm;
