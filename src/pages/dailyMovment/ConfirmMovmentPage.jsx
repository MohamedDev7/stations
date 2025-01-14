import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { changeMovmentState, getMovmentData } from "../../api/serverApi";
import { useMutation, useQuery } from "react-query";
import Card from "../../UI/card/Card";
import {
	Spinner,
	Table,
	TableCell,
	TableHeader,
	TableHeaderCell,
} from "@fluentui/react-components";
import { TableBody, TableRow } from "@mui/material";
import { DefaultButton, PrimaryButton, TextField } from "@fluentui/react";
import TopBar from "../../components/TopBar/TopBar";
import { DismissRegular, SaveRegular } from "@fluentui/react-icons";
import { toast } from "react-toastify";

const ConfirmMovmentPage = () => {
	//hooks
	const info = useLocation();
	const navigate = useNavigate();
	console.log(`info`, info);

	//queries
	const { data: movmentReport, isLoading } = useQuery({
		queryKey: ["movmentReport", info.state.movment_id],
		queryFn: getMovmentData,
		select: (res) => {
			console.log(`res`, res);
			return res.data;
		},
	});
	const saveMutation = useMutation({
		mutationFn: changeMovmentState,
		onSuccess: (res) => {
			toast.success("تم اعتماد الحركة بنجاح", {
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
	return (
		<>
			<TopBar
				right={
					<>
						<DefaultButton
							appearance="secondary"
							onClick={() => {
								navigate("./..");
							}}
						>
							<DismissRegular fontSize={20} style={{ margin: "0 3px" }} />
							الغاء
						</DefaultButton>
						<PrimaryButton
							appearance="primary"
							type="submit"
							onClick={() => {
								saveMutation.mutate({
									state: "approved",
									movment_id: info.state.movment_id,
								});
							}}
						>
							<SaveRegular fontSize={20} style={{ margin: "0 3px" }} />
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
				{isLoading ? (
					<Spinner />
				) : (
					<>
						<Card title="خلاصة الحركة اليومية">
							<div>
								<div
									style={{
										display: "flex",
										gap: "10px",
										margin: "10px 0",
										fontSize: "16px",
										fontWeight: "bold",
									}}
								>
									<div>المحطة:</div>
									<div>{info.state.station_name}</div>
								</div>
								<div
									style={{
										display: "flex",
										gap: "10px",
										margin: "10px 0",
										fontSize: "16px",
										fontWeight: "bold",
									}}
								>
									<div>التاريخ:</div>
									<div>{info.state.date}</div>
								</div>
								<div
									style={{
										display: "flex",
										gap: "10px",
										margin: "10px 0",
										fontSize: "16px",
										fontWeight: "bold",
									}}
								>
									<div>رقم الحركة:</div>
									<div>{info.state.number}</div>
								</div>
								<div
									style={{
										display: "flex",
										gap: "10px",
										margin: "10px 0",
										fontSize: "16px",
										fontWeight: "bold",
									}}
								>
									<div>عدد المناوبات:</div>
									<div>{info.state.shifts}</div>
								</div>
							</div>
						</Card>
						<Card title="حركة المخازن">
							<Table arial-label="Default table">
								<TableHeader>
									<TableRow>
										<TableHeaderCell>المخزن</TableHeaderCell>
										<TableHeaderCell>الرصيد السابق</TableHeaderCell>
										<TableHeaderCell>الرصيد الحالي</TableHeaderCell>
									</TableRow>
								</TableHeader>
								<TableBody>
									{movmentReport.storesMovment.map((store) => (
										<TableRow key={store.id}>
											<TableCell>
												<TextField
													value={`${store.name}-${store.substance}`}
													readOnly
												/>
											</TableCell>
											<TableCell>
												<TextField value={store.prev_value} readOnly />
											</TableCell>
											<TableCell>
												<TextField value={store.curr_value} readOnly />
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</Card>
						<Card title="حركة العدادات">
							<Table arial-label="Default table">
								<TableHeader>
									<TableRow>
										<TableHeaderCell rowSpan={2}>
											بيانات الطرمبة
										</TableHeaderCell>
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
									{movmentReport.dispensersMovment.map((dispenser) => (
										<TableRow key={dispenser.id}>
											<TableCell>
												<TextField
													value={`${dispenser.number}-${dispenser.substance}`}
													readOnly
												/>
											</TableCell>
											<TableCell>
												<TextField value={dispenser.prev_A} readOnly />
											</TableCell>
											<TableCell>
												<TextField value={dispenser.curr_A} readOnly />
											</TableCell>
											<TableCell>
												<TextField value={dispenser.prev_B} readOnly />
											</TableCell>
											<TableCell>
												<TextField value={dispenser.curr_B} readOnly />
											</TableCell>
											<TableCell>
												<TextField
													readOnly
													value={
														dispenser.curr_A -
														dispenser.prev_A +
														dispenser.curr_B -
														dispenser.prev_B
													}
												/>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</Card>
						<Card title="الواردات">
							<Table arial-label="Default table">
								<TableHeader>
									<TableRow>
										<TableHeaderCell>الكمية</TableHeaderCell>
										<TableHeaderCell>المستودع</TableHeaderCell>
										<TableHeaderCell>الناقلة</TableHeaderCell>
										<TableHeaderCell>السائق</TableHeaderCell>
									</TableRow>
								</TableHeader>
								<TableBody>
									{movmentReport.incomes.map((income, i) => (
										<TableRow key={i}>
											<TableCell>
												<TextField value={income.amount} readOnly />
											</TableCell>
											<TableCell>
												<TextField
													value={`${income.store.name} - ${income.store.substance.name}`}
													readOnly
												/>
											</TableCell>
											<TableCell>
												<TextField value={income.truck_number} readOnly />
											</TableCell>
											<TableCell>
												<TextField value={income.truck_driver} readOnly />
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</Card>
						{movmentReport && movmentReport.calibrations.length > 0 && (
							<Card title="معايرة">
								<Table arial-label="Default table">
									<TableHeader>
										<TableRow>
											<TableHeaderCell>الكمية</TableHeaderCell>
											<TableHeaderCell>المستودع</TableHeaderCell>
										</TableRow>
									</TableHeader>
									<TableBody>
										{movmentReport.calibrations.map((item) => (
											<TableRow key={item.id}>
												<TableCell>
													<TextField value={item.amount} readOnly />
												</TableCell>
												<TableCell>
													<TextField
														value={`${item.store.name} - ${item.store.substance.name}`}
														readOnly
													/>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</Card>
						)}
						{movmentReport && movmentReport.surplus.length > 0 && (
							<Card title="فائض">
								<Table arial-label="Default table">
									<TableHeader>
										<TableRow>
											<TableHeaderCell>الكمية</TableHeaderCell>
											<TableHeaderCell>المستودع</TableHeaderCell>
										</TableRow>
									</TableHeader>
									<TableBody>
										{movmentReport.surplus.map((item) => (
											<TableRow key={item.id}>
												<TableCell>
													<TextField value={item.amount} readOnly />
												</TableCell>
												<TableCell>
													<TextField
														value={`${item.store.name} - ${item.store.substance.name}`}
														readOnly
													/>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</Card>
						)}
						{movmentReport && movmentReport.coupons.length > 0 && (
							<Card title="مسحوبات الفرع">
								<Table arial-label="Default table">
									<TableHeader>
										<TableRow>
											<TableHeaderCell>الكمية</TableHeaderCell>
											<TableHeaderCell>المستودع</TableHeaderCell>
											<TableHeaderCell>النوع</TableHeaderCell>
										</TableRow>
									</TableHeader>
									<TableBody>
										{movmentReport.coupons.map((item) => (
											<TableRow key={item.id}>
												<TableCell>
													<TextField value={item.amount} readOnly />
												</TableCell>
												<TableCell>
													<TextField
														value={`${item.store.name} - ${item.store.substance.name}`}
														readOnly
													/>
												</TableCell>
												<TableCell>
													<TextField value={item.type} readOnly />
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</Card>
						)}
						{movmentReport && movmentReport.others.length > 0 && (
							<Card title="مسحوبات اخرى">
								<Table arial-label="Default table">
									<TableHeader>
										<TableRow>
											<TableHeaderCell>المخزن</TableHeaderCell>
											<TableHeaderCell>البيان</TableHeaderCell>
											<TableHeaderCell>الكمية</TableHeaderCell>
											{/* <TableHeaderCell>اجمالي المبلغ</TableHeaderCell> */}
										</TableRow>
									</TableHeader>
									<TableBody>
										{movmentReport.others.map((item) => (
											<TableRow key={item.id}>
												<TableCell>
													<TextField
														value={`${item.store.name} - ${item.store.substance.name}`}
														readOnly
													/>
												</TableCell>
												<TableCell>
													<TextField value={item.title} readOnly />
												</TableCell>
												<TableCell>
													<TextField value={item.amount} readOnly />
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</Card>
						)}
					</>
				)}
			</div>
		</>
	);
};
export default ConfirmMovmentPage;
