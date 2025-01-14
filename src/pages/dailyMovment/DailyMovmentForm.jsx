import React, { useState } from "react";
import TopBar from "../../components/TopBar/TopBar";
import { DismissRegular, SaveRegular } from "@fluentui/react-icons";
import Card from "../../UI/card/Card";
import Row from "../../UI/row/Row";
import { useMutation, useQuery } from "react-query";
import {
	getAllStations,
	addMovment,
	getStationMovmentByDate,
} from "../../api/serverApi";
import { useLocation, useNavigate } from "react-router-dom";

import {
	DefaultButton,
	Dropdown,
	PrimaryButton,
	TextField,
} from "@fluentui/react";
import { toast } from "react-toastify";

const DailyMovmentForm = () => {
	//hooks
	const navigate = useNavigate();
	const info = useLocation();

	//states
	const [station, setStation] = useState("");
	const [date, setDate] = useState("");
	const [prevDate, setPrevDate] = useState("");
	const [number, setNumber] = useState("");
	//queries

	const { data: stations } = useQuery({
		queryKey: ["stations"],
		queryFn: getAllStations,
		select: (res) => {
			return res.data.stations.map((el) => el);
		},
	});
	useQuery({
		queryKey: ["LastMovments", station, prevDate],
		queryFn: getStationMovmentByDate,
		onSuccess: (res) => {
			if (!res.data.movment) {
				setNumber("");
				return;
			}
			let movmentNumber = +res.data.movment.number.substring(4) + 1;
			const movmentStr = `${movmentNumber}`.padStart(4, "0");
			const fullNumber = `${res.data.movment.number.substring(
				0,
				4
			)}${movmentStr}`;

			setNumber(fullNumber);
		},
		enabled: !!station && !!prevDate,
	});

	const saveMutation = useMutation({
		mutationFn: addMovment,
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
	const onSaveMovmentHandler = () => {
		saveMutation.mutate({
			date,
			station_id: station,
			number,
			station_number: stations.filter((el) => el.id === station)[0].number,
		});
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
				<Card title="بيانات الحركة">
					<Row flex={[3, 2, 4]}>
						<Dropdown
							onChange={(e, selection) => {
								setStation(selection.key);
							}}
							label="اسم المحطة"
							placeholder="اختر المحطة"
							options={
								stations &&
								stations.map((el) => {
									return { key: el.id, text: el.name };
								})
							}
						/>
						<TextField
							label="التاريخ"
							placeholder="تاريخ الوارد"
							value={date}
							type="date"
							onChange={(e) => {
								e.stopPropagation();
								const currDate = new Date(e.target.value);
								const previousDay = new Date(currDate);
								previousDay.setDate(currDate.getDate() - 1);
								console.log(`previousDay`, previousDay);
								setDate(e.target.value);
								setPrevDate(new Date(previousDay).toISOString().split("T")[0]);
							}}
						/>
						<TextField
							label="رقم الحركة"
							placeholder="رقم الحركة"
							value={number}
							readOnly
							type="number"
							// onChange={(e) => {
							// 	e.stopPropagation();
							// 	setNumber(+e.target.value);
							// }}
							// disabled
						/>
					</Row>
				</Card>
			</div>
		</form>
	);
};

export default DailyMovmentForm;
