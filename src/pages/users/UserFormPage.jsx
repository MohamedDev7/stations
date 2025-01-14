import React, { useState } from "react";
import TopBar from "../../components/TopBar/TopBar";
import { Button, Checkbox, Field, Input } from "@fluentui/react-components";
import { SaveRegular } from "@fluentui/react-icons";
import Card from "../../UI/card/Card";
import Row from "../../UI/row/Row";
import { useMutation, useQuery } from "react-query";
import {
	addUser,
	editUser,
	getAllStations,
	getUser,
} from "../../api/serverApi";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import EmptyContainer from "../../components/EmptyContainer/EmptyContainer";
const UserFormPage = () => {
	//hooks
	const navigate = useNavigate();
	const info = useLocation();

	//states
	const [username, setUsername] = useState("");
	const [firstname, setFirstname] = useState("");
	const [lastname, setLastname] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [permissions, setPermissions] = useState({
		addUser: false,
		editUser: false,
		deleteUser: false,
		addDuesList: false,
		editDuesList: false,
		deleteDuesList: false,
		editDuesListState: false,
		addBeneficiary: false,
		editBeneficiary: false,
		deleteBeneficiary: false,
		addTreasury: false,
		editTreasury: false,
		deleteTreasury: false,
		addPay: false,
		deletePay: false,
		addSalaryAdvance: false,
		addReceive: false,
		deleteReceive: false,
		receiveReports: false,
	});
	const [selectedStations, setSelectedStations] = useState([]);
	//queries
	useQuery({
		queryKey: ["user", info.state?.id],
		queryFn: getUser,
		onSuccess: (res) => {
			setUsername(res.data.user.username);
			setFirstname(res.data.user.first_name);
			setLastname(res.data.user.last_name);

			res.data.permissions.forEach((el) => {
				setPermissions((prev) => {
					return { ...prev, [el.permission]: true };
				});
			});
			setSelectedStations(res.data.stations);
		},
		enabled: !!info.state,
	});
	//queries
	const { data: stations } = useQuery({
		queryKey: ["stations"],
		queryFn: getAllStations,
		select: (res) => {
			return res.data.stations.map((el) => el);
		},
	});
	const addMutation = useMutation({
		mutationFn: addUser,
		onSuccess: (res) => {
			toast.success("تم إضافةالمستخدم بنجاح", {
				position: "top-center",
			});
			navigate("./..", {
				// state: {
				// 	receive: res.data.receive[0],
				// },
			});
		},
		onError: (err) => {
			toast.error(err.response.data.message, {
				position: "top-center",
			});
		},
	});
	const editMutation = useMutation({
		mutationFn: editUser,
		onSuccess: (res) => {
			toast.success("تم تعديل المستخدم بنجاح", {
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
	const handleStationsCheckboxChange = (station) => {
		console.log(`station`, station);
		const index = selectedStations.findIndex(
			(el) => el.station_id === station.id
		);
		console.log(`index`, index);
		if (index === -1) {
			// Station is checked, add it to selectedStations
			setSelectedStations([...selectedStations, { station_id: station.id }]);
		} else {
			// Station is unchecked, remove it from selectedStations
			const updatedStations = [...selectedStations];
			updatedStations.splice(index, 1);
			setSelectedStations(updatedStations);
		}
	};
	const test = () => {
		console.log(`selected`, selectedStations);
	};
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				if (password !== confirmPassword) {
					toast.error("كلمة المرور غير متطابقة", {
						position: "top-center",
					});
					return;
				}

				info.state
					? editMutation.mutate({
							username,
							password,
							firstname,
							lastname,
							permissions,
							id: info.state.id,
							stations: selectedStations,
					  })
					: addMutation.mutate({
							username,
							password,
							firstname,
							lastname,
							permissions,
							stations: selectedStations,
					  });
			}}
		>
			<TopBar
				right={
					<>
						<Button appearance="outline" onClick={() => navigate("./..")}>
							الغاء
						</Button>
						<Button appearance="primary" icon={<SaveRegular />} type="submit">
							حفظ
						</Button>
						<button type="button" onClick={test}>
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
				<Card title="بيانات المستخدم">
					<Row flex={[1, 3]}>
						<Field label="اسم المستخدم" required>
							<Input
								value={username}
								onChange={(e) => setUsername(e.target.value)}
							/>
						</Field>
						<></>
						<></>
					</Row>
					<Row flex={[1, 1, 1, 1]}>
						<Field label="الاسم الاول">
							<Input
								value={firstname}
								onChange={(e) => setFirstname(e.target.value)}
							/>
						</Field>
						<Field label="الاسم الاخير">
							<Input
								value={lastname}
								onChange={(e) => setLastname(e.target.value)}
							/>
						</Field>
						<></>
						<></>
					</Row>
					<Row flex={[1, 1, 1, 1]}>
						<Field label="كلمة المرور" required>
							<Input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</Field>
						<Field label="تاكيد كلمة المرور" required>
							<Input
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
							/>
						</Field>
						<></>
						<></>
					</Row>
				</Card>
				<Card title="صلاحيات المستخدم">
					<Row flex={[1, 1, 1]}>
						<Card title="المستخدمين">
							<Checkbox
								checked={permissions.addUser}
								onChange={(ev, data) =>
									setPermissions((prev) => {
										return { ...prev, addUser: data.checked };
									})
								}
								label="إضافة مستخدم"
							/>
							<Checkbox
								checked={permissions.editUser}
								onChange={(ev, data) =>
									setPermissions((prev) => {
										return { ...prev, editUser: data.checked };
									})
								}
								label="تعديل مستخدم"
							/>
							<Checkbox
								checked={permissions.deleteUser}
								onChange={(ev, data) =>
									setPermissions((prev) => {
										return { ...prev, deleteUser: data.checked };
									})
								}
								label="حذف مستخدم"
							/>
						</Card>
						<Card title="المستحقات">
							<Checkbox
								checked={permissions.addDuesList}
								onChange={(ev, data) =>
									setPermissions((prev) => {
										return { ...prev, addDuesList: data.checked };
									})
								}
								label="إضافة كشف مستحقات"
							/>
							<Checkbox
								checked={permissions.editDuesList}
								onChange={(ev, data) =>
									setPermissions((prev) => {
										return { ...prev, editDuesList: data.checked };
									})
								}
								label="تعديل كشف مستحقات"
							/>
							<Checkbox
								checked={permissions.deleteDuesList}
								onChange={(ev, data) =>
									setPermissions((prev) => {
										return { ...prev, deleteDuesList: data.checked };
									})
								}
								label="حذف كشف مستحقات"
							/>
							<Checkbox
								checked={permissions.editDuesListState}
								onChange={(ev, data) =>
									setPermissions((prev) => {
										return { ...prev, editDuesListState: data.checked };
									})
								}
								label="تعديل حالة الكشف"
							/>
						</Card>
						<Card title="المستفيدين">
							<Checkbox
								checked={permissions.addBeneficiary}
								onChange={(ev, data) =>
									setPermissions((prev) => {
										return { ...prev, addBeneficiary: data.checked };
									})
								}
								label="إضافة مستفيد"
							/>
							<Checkbox
								checked={permissions.editBeneficiary}
								onChange={(ev, data) =>
									setPermissions((prev) => {
										return { ...prev, editBeneficiary: data.checked };
									})
								}
								label="تعديل مستفيد"
							/>
							<Checkbox
								checked={permissions.deleteBeneficiary}
								onChange={(ev, data) =>
									setPermissions((prev) => {
										return { ...prev, deleteBeneficiary: data.checked };
									})
								}
								label="حذف مستفيد"
							/>
						</Card>
					</Row>
					<Row flex={[1, 1, 1]}>
						<Card title="الصرف">
							<Checkbox
								checked={permissions.addPay}
								onChange={(ev, data) =>
									setPermissions((prev) => {
										return { ...prev, addPay: data.checked };
									})
								}
								label="إضافة سند صرف"
							/>
							<Checkbox
								checked={permissions.deletePay}
								onChange={(ev, data) =>
									setPermissions((prev) => {
										return { ...prev, deletePay: data.checked };
									})
								}
								label="حذف سند صرف"
							/>
							<Checkbox
								checked={permissions.addSalaryAdvance}
								onChange={(ev, data) =>
									setPermissions((prev) => {
										return { ...prev, addSalaryAdvance: data.checked };
									})
								}
								label="صرف سلفة"
							/>
						</Card>
						<Card title="القبض">
							<Checkbox
								checked={permissions.addReceive}
								onChange={(ev, data) =>
									setPermissions((prev) => {
										return { ...prev, addReceive: data.checked };
									})
								}
								label="إضافة سند قبض"
							/>
							<Checkbox
								checked={permissions.deleteReceive}
								onChange={(ev, data) =>
									setPermissions((prev) => {
										return { ...prev, deleteReceive: data.checked };
									})
								}
								label="حذف سند قبض"
							/>
						</Card>
						<Card title="الصناديق المالية">
							<Checkbox
								checked={permissions.addTreasury}
								onChange={(ev, data) =>
									setPermissions((prev) => {
										return { ...prev, addTreasury: data.checked };
									})
								}
								label="إضافة صندوق"
							/>
							<Checkbox
								checked={permissions.editTreasury}
								onChange={(ev, data) =>
									setPermissions((prev) => {
										return { ...prev, editTreasury: data.checked };
									})
								}
								label="تعديل صندوق"
							/>
							<Checkbox
								checked={permissions.deleteTreasury}
								onChange={(ev, data) =>
									setPermissions((prev) => {
										return { ...prev, deleteTreasury: data.checked };
									})
								}
								label="حذف صندوق"
							/>
						</Card>
						<></>
					</Row>
					<Row flex={[1, 1, 1]}>
						<Card title="التقارير">
							<Checkbox
								checked={permissions.receiveReports}
								onChange={(ev, data) =>
									setPermissions((prev) => {
										return { ...prev, receiveReports: data.checked };
									})
								}
								label="تقارير الاستلام"
							/>
						</Card>
						<></>
						<></>
					</Row>
				</Card>
				<Card title="المحطات">
					{stations && stations.length > 0 ? (
						stations.map((station) => (
							<Checkbox
								key={station.id}
								label={station.name}
								checked={selectedStations.some(
									(el) => el.station_id === station.id
								)}
								onChange={() => handleStationsCheckboxChange(station)}
							/>
						))
					) : (
						<EmptyContainer msg="لا توجد بيانات" />
					)}
				</Card>
			</div>
		</form>
	);
};

export default UserFormPage;
