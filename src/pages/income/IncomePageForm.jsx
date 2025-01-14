import React, { useState } from "react";
import TopBar from "../../components/TopBar/TopBar";
import { DismissRegular, SaveRegular } from "@fluentui/react-icons";
import Card from "../../UI/card/Card";
import Row from "../../UI/row/Row";
import { useMutation, useQuery } from "react-query";
import {
	addIncome,
	editIncome,
	getAllStations,
	getAllSubstances,
	getEmployeeByStationId,
	getShiftsByStationId,
	getStationPendingMovment,
	getStoreByStationId,
	getTanksByStationId,
} from "../../api/serverApi";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
	TextField,
	Dropdown,
	DatePicker,
	DefaultButton,
	PrimaryButton,
} from "@fluentui/react";
import TimeChange from "./../../utils/TimeChange";
const IncomePageForm = () => {
	//hooks
	const navigate = useNavigate();
	const info = useLocation();
	//states
	const [station, setStation] = useState("");
	const [shift, setShift] = useState("");
	const [amount, setAmount] = useState(0);
	const [substance, setSubstance] = useState("");
	const [tank, setTank] = useState("");
	const [store, setStore] = useState("");
	const [employee, setEmployee] = useState("");
	const [truckNumber, setTruckNumber] = useState("");
	const [truckDriver, setTruckDriver] = useState("");
	const [prevData, setPrevData] = useState({
		movmentId: "",
		shiftNumber: "",
	});
	//queries
	const { data: stations } = useQuery({
		queryKey: ["stations"],
		queryFn: getAllStations,
		select: (res) => {
			return res.data.stations.map((el) => el);
		},
	});
	const { data: currMovment } = useQuery({
		queryKey: ["currMovment", station],
		queryFn: getStationPendingMovment,
		select: (res) => {
			return res.data.pendingMovment[0];
		},
		enabled: !!station,
	});
	const { data: shifts } = useQuery({
		queryKey: ["shifts", station],
		queryFn: getShiftsByStationId,
		select: (res) => {
			return res.data.shifts;
		},
		enabled: !!station,
	});
	const { data: substances } = useQuery({
		queryKey: ["substances"],
		queryFn: getAllSubstances,
		select: (res) => {
			return res.data.substances.map((el) => el);
		},
	});
	const { data: tanks } = useQuery({
		queryKey: ["tanks", station],
		queryFn: getTanksByStationId,
		select: (res) => {
			return res.data.tanks.map((el) => el);
		},
		enabled: !!station,
	});
	const { data: stores } = useQuery({
		queryKey: ["stores", station],
		queryFn: getStoreByStationId,
		select: (res) => {
			return res.data.stores.map((el) => el);
		},
		enabled: !!station,
	});
	const { data: employees } = useQuery({
		queryKey: ["employees", station],
		queryFn: getEmployeeByStationId,
		select: (res) => {
			return res.data.employees.map((el) => el);
		},
		enabled: !!station,
	});
	const saveMutation = useMutation({
		mutationFn: addIncome,
		onSuccess: (res) => {
			toast.success("تم إضافة الوارد بنجاح", {
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
	const editMutation = useMutation({
		mutationFn: editIncome,
		onSuccess: (res) => {
			toast.success("تم تعديل الصندوق بنجاح", {
				position: "top-center",
			});
			navigate("./..", {});
		},
		onError: (err) => {
			toast.error(err.response.data.message, {
				position: "top-center",
			});
		},
	});
	//functions
	const test = () => {
		console.log(`station`, station);
	};
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				info.state
					? editMutation.mutate({
							name,
							id: info.state.id,
					  })
					: saveMutation.mutate({
							station,
							date,
							amount,
							substance,
							tank,
							store,
							truckDriver,
							truckNumber,
							employee,
							movmentId: currMovment.id,
							shift: shifts.filter((el) => el.id === shift)[0].number,
							start: shifts.filter((el) => el.id === shift)[0].start,
							end: shifts.filter((el) => el.id === shift)[0].end,
					  });
			}}
		>
			<TopBar
				right={
					<>
						<button onClick={test}>test</button>
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
				<Card title="بيانات الوارد">
					<Row flex={[2, 2, 1]}>
						<Dropdown
							onChange={(_, data) => {
								setStation(data.key);
							}}
							label="المحطة"
							placeholder="المحطة"
							options={
								stations &&
								stations.length > 0 &&
								stations.map((el) => {
									return { key: el.id, text: el.name, value: el.id };
								})
							}
						/>
						<Dropdown
							onChange={(e, selection) => {
								setShift(selection.key);
							}}
							value={shift}
							label="المناوبة"
							placeholder="اختر النوبة"
							options={
								shifts &&
								shifts.map((el) => {
									return {
										key: el.id,
										shiftNumber: el.number,
										text: `${el.number}- من ${TimeChange(
											el.start
										)} الى ${TimeChange(el.end)}`,
									};
								})
							}
						/>
						<TextField
							// firstDayOfWeek={firstDayOfWeek}
							label="التاريخ"
							placeholder="تاريخ الوارد"
							value={date}
							type="date"
							onChange={(e) => {
								e.stopPropagation();
								setDate(e.target.value);
							}}
							// strings={defaultDatePickerStrings}
						/>
					</Row>
					<Row flex={[2, 1, 1, 2]}>
						<TextField
							required
							label="الكمية"
							value={amount}
							onChange={(e) => {
								e.stopPropagation();
								setAmount(e.target.value);
							}}
							type="number"
						/>
						<Dropdown
							onChange={(_, data) => {
								setSubstance(data.key);
							}}
							label="المادة"
							placeholder="المادة"
							options={
								substances &&
								substances.length > 0 &&
								substances.map((el) => {
									return { key: el.id, text: el.name, value: el.id };
								})
							}
						/>
						<Dropdown
							onChange={(_, data) => {
								setTank(data.key);
							}}
							label="الخزان"
							placeholder="الخزان"
							options={
								tanks &&
								tanks.length > 0 &&
								tanks.map((el) => {
									return { key: el.id, text: el.number, value: el.id };
								})
							}
						/>

						<Dropdown
							onChange={(_, data) => {
								setStore(data.key);
							}}
							label="المستودع"
							placeholder="اسم المستودع"
							options={
								stores &&
								stores.length > 0 &&
								stores.map((el) => {
									return { key: el.id, text: el.name, value: el.id };
								})
							}
						/>
					</Row>
					<Row flex={[1, 2, 2]}>
						<TextField
							required
							label="رقم الناقلة"
							value={truckNumber}
							onChange={(e) => {
								e.stopPropagation();
								setTruckNumber(e.target.value);
							}}
						/>
						<TextField
							required
							label="السائق"
							value={truckDriver}
							onChange={(e) => {
								e.stopPropagation();
								setTruckDriver(e.target.value);
							}}
						/>

						{/* <Dropdown
							onChange={(_, data) => {
								setEmployee(data.key);
							}}
							label="المستلم"
							placeholder="اسم المستلم"
							options={
								employees &&
								employees.length > 0 &&
								employees.map((el) => {
									return { key: el.id, text: el.name, value: el.id };
								})
							}
						/> */}
					</Row>
				</Card>
			</div>
		</form>
	);
};

export default IncomePageForm;
