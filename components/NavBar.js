import React from "react";
import { Box, AppBar, Toolbar, Button, Fade, Menu, MenuItem, IconButton, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useWidth } from "../context/WidthContext";
import { useTheme } from "next-themes";
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

// React functional component to render the NavBar
const NavBarComponent = () => {
    // Width context containing the screen width and light/dark mode theme components
    const { width, height } = useWidth();
    const { theme, setTheme } = useTheme();

    // Function and states to handle the opening and closing of the mobile drop down
    const [menuElement, setMenuElement] = React.useState(null);
    const open = Boolean(menuElement);
    const handleClick = (event) => {
        setMenuElement(event.currentTarget);
    };
    const handleClose = () => {
        setMenuElement(null);
    };

    // Handles the changing of light/dark mode theme
    const handleMode = () => {
        if (theme === "light") {
            setTheme("dark");
        }
        else {
            setTheme("light");
        }
    }

    return (
        <>
            {width > 900 ? 
                <Fade in={true} timeout={1000}>
                    <Box sx={{ marginBottom: "35px", width: "100%" }}>
                        <AppBar position="static" color="primary" sx={{boxShadow: "none"}}>
                            <Toolbar>
                                <div style={{ display: "flex", width: "25%", paddingLeft: "5%" }}>
                                    <Link href="/" passHref>
                                        <Button color="secondary" sx={{ fontSize: "20px", fontWeight: "bold" }}>
                                            <Typography variant="h6" sx={{ fontFamily: "Source Sans Pro" }}><strong>Team 8: Sprint 9</strong></Typography>
                                        </Button>
                                    </Link>
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                    <IconButton onClick={handleMode} sx={{ fontSize: "20px", color: "#DE3922", fontWeight: "bold" }}>
                                        {theme === "light" ? <DarkModeIcon color="info" /> : <LightModeIcon color="secondary" />}
                                    </IconButton>
                                </div>

                                <div style={{ width: "75%", display: "flex", justifyContent: "flex-end" }}>
                                    <ButtonComponent buttonNavigate="/" buttonName="Welcome" theme={theme} />
                                    <ButtonComponent buttonNavigate="/search" buttonName="Search" theme={theme}  />
                                    <ButtonComponent buttonNavigate="/degree" buttonName="Graph Degrees" theme={theme}  />
                                    <ButtonComponent buttonNavigate="/subject" buttonName="Graph Subjects" theme={theme}  />
                                </div>
                            </Toolbar>
                        </AppBar>
                    </Box>
                </Fade>
            :
                <Fade in={true} timeout={1000}>
                    <Box sx={{ marginBottom: "35px", width: "100%" }}>
                        <AppBar position="static" sx={{ background: "transparent", boxShadow: "none" }}>
                            <Toolbar sx={{ marginTop: "2%" }}>
                                <Link href="/" passHref>
                                    <Button sx={{ marginRight: "2%", paddingRight: "1%", fontFamily: "Ubuntu", fontSize: "22px", fontWeight: "bold", color: "#DE3922" }}>
                                        <i>T8: S9</i>
                                    </Button>
                                </Link>
                                <IconButton onClick={handleMode} sx={{ fontSize: "20px", color: "#DE3922", fontWeight: "bold" }}>
                                    {theme === "light" ? <DarkModeIcon /> : <LightModeIcon />}
                                </IconButton>

                                <IconButton sx={{ position: "absolute", right: "0", marginRight: "3%" }} onClick={handleClick}>
                                    <MenuIcon sx={{fontSize: "40px", color: "#DE3922"}} />
                                </IconButton>

                                <Menu anchorEl={menuElement} open={open} onClose={handleClose}>
                                    <MenuItemComponent menuItemNavigate="/" menuItemName="Welcome" />
                                    <MenuItemComponent menuItemNavigate="/search" menuItemName="Search Courses" />
                                    <MenuItemComponent menuItemNavigate="/degree" menuItemName="Graph Degrees" />
                                    <MenuItemComponent menuItemNavigate="/subject" menuItemName="Graph Subjects" />
                                </Menu>
                            </Toolbar>
                        </AppBar>
                    </Box>
                </Fade>
            }
        </>
    )
}

export default NavBarComponent;

// Button component that renders a styled button
const ButtonComponent = ({ buttonNavigate, buttonName, theme }) => {
    let active = false;
    
    const router = useRouter();
    if (router.pathname === buttonNavigate){
        active = true
    }

    return (
        <Link href={buttonNavigate}>
            {active ?
                <Button color={theme === "light" ? "info" : "secondary"} sx={{ borderBottom: "2px solid", borderRadius: "0", fontSize: "16px", marginRight: "3%", paddingRight: "1%", paddingLeft: "1%" }}>
                    <Typography variant="button" color={theme === "light" ? "info" : "secondary"} sx={{ fontFamily: "Source Sans Pro", fontWeight: "bold" }}>{buttonName}</Typography>
                </Button>
            :
                <Button color={theme === "light" ? "secondary" : "info"} sx={{ "&:hover": { color:"#8B0000", borderBottom: "2px solid", borderRadius: "0" }, marginRight: "3%", paddingRight: "1%", paddingLeft: "1%" }}>
                    <Typography variant="button" sx={{ fontFamily: "Source Sans Pro", fontWeight: "bold" }}>{buttonName}</Typography>
                </Button>
            }
        </Link>
    )
}

// Menu item component that renders a styled menu item component
const MenuItemComponent = ({ menuItemNavigate, menuItemName }) => {
    let active = false;

    const router = useRouter();
    if (router.pathname === menuItemNavigate){
        active = true
    }

    return (
        <>
            {active ?
                <MenuItem sx={{ backgroundColor: "#FFD8D8", fontSize: "20px" }}>
                    <Button href={menuItemNavigate} sx={{ fontFamily: "Source Sans Pro" }}>
                        {menuItemName}
                    </Button>
                </MenuItem>
            :
                <MenuItem sx={{ fontSize: "20px" }}>
                    <Button href={menuItemNavigate} sx={{ fontFamily: "Source Sans Pro" }}>
                        {menuItemName}
                    </Button>
                </MenuItem>
            }
        </>
    )
}
