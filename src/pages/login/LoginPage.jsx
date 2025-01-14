import { useContext, useState } from "react";
import { AuthContext } from "../../store/auth-context";
import classes from "./loginPage.module.scss";
import logo from "../../assets/logo.png";

import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Button, Input } from "@fluentui/react-components";
const LoginPage = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [passwordIshidden, setPasswordIshidden] = useState(true);
	const [err, setErr] = useState("");
	const usernameChangeHandler = (e) => {
		setUsername(e.target.value);
	};
	const passwordChangeHandler = (e) => {
		setPassword(e.target.value);
	};
	const { login } = useContext(AuthContext);
	const loginHandler = async (e) => {
		try {
			e.preventDefault();
			await login({
				username: username,
				password: password,
				db: "ypc-financial-2024",
			});
		} catch (err) {
			setErr(err.response.data.message);
		}
	};
	const changePasswordVisibility = () => {
		setPasswordIshidden(!passwordIshidden);
	};
	return (
		<div className={classes.container}>
			<div className={classes.innerContainer}>
				<div className={classes.imgContainer}>
					<img src={logo} alt="" />
				</div>
				<form className={classes.form} onSubmit={loginHandler}>
					<Input title="أسم المستخدم" onChange={usernameChangeHandler} />
					<div style={{ position: "relative" }}>
						<Input
							title="كلمة المرور"
							type={passwordIshidden ? "password" : "text"}
							onChange={passwordChangeHandler}
						/>
						<span
							style={{ position: "absolute", bottom: -3, left: 5 }}
							onClick={changePasswordVisibility}
						>
							{passwordIshidden ? <VisibilityIcon /> : <VisibilityOffIcon />}
						</span>
					</div>
					{err && <div>{err}</div>}
					<Button color="white" type="submit" backgroundColor="blue">
						دخول
					</Button>
				</form>
			</div>
		</div>
	);
};

export default LoginPage;
