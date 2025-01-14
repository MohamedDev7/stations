import classes from "./sideBar.module.scss";
import { Link } from "react-router-dom";
import { useState } from "react";
import logo from "../../assets/logo.png";

import {
	Hamburger,
	NavCategory,
	NavCategoryItem,
	NavDrawer,
	NavDrawerBody,
	NavDrawerHeader,
	NavItem,
	NavSubItem,
	NavSubItemGroup,
} from "@fluentui/react-nav-preview";
import { SettingsRegular, PersonRegular } from "@fluentui/react-icons";
import { Tooltip, makeStyles } from "@fluentui/react-components";
const useStyles = makeStyles({
	root: {
		display: "flex",
		background: "#d9dee4",
		zIndex: "3 !important",
	},
	content: {
		display: "grid",
		justifyContent: "flex-start",
		alignItems: "flex-start",
	},
});
const SideBar = () => {
	const styles = useStyles();
	const [isOpen, setIsOpen] = useState(true);
	const [type, setType] = useState("inline");
	const [isMultiple, setIsMultiple] = useState(false);

	const renderHamburgerWithToolTip = () => {
		return (
			<Tooltip content="Navigation" relationship="label">
				<Hamburger onClick={() => setIsOpen(!isOpen)} />
			</Tooltip>
		);
	};

	return (
		<div className={styles.root}>
			<NavDrawer
				defaultSelectedValue="2"
				defaultSelectedCategoryValue=""
				open={isOpen}
				type={type}
				multiple={isMultiple}
			>
				<NavDrawerHeader>{renderHamburgerWithToolTip()}</NavDrawerHeader>
				<NavDrawerBody className={styles.content}>
					<NavDrawerBody>
						<Link to="/">
							<div className={classes.logoContainer}>
								<img src={logo} alt="" className={classes.logo} />
							</div>
						</Link>
						<Link to="/dailyMovment">
							<NavItem value="1" icon={<PersonRegular />}>
								الحركة اليومية
							</NavItem>
						</Link>
						<Link to="/test">
							<NavItem value="3" icon={<PersonRegular />}>
								test
							</NavItem>
						</Link>
						<NavCategory value="2">
							<NavCategoryItem icon={<SettingsRegular />}>
								الاعدادات
							</NavCategoryItem>
							<NavSubItemGroup>
								<Link to="/users">
									<NavSubItem value="3">المستخدمين</NavSubItem>
								</Link>
								<Link to="/stations">
									<NavSubItem value="4">المحطات</NavSubItem>
								</Link>
								<Link to="/substances">
									<NavSubItem value="5">المواد</NavSubItem>
								</Link>
							</NavSubItemGroup>
						</NavCategory>
					</NavDrawerBody>
				</NavDrawerBody>
			</NavDrawer>
			{!isOpen && (
				<div className={styles.content}>{renderHamburgerWithToolTip()}</div>
			)}
		</div>
	);
};

export default SideBar;
