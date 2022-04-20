import { createTheme, ThemeProvider } from '@mui/material/styles';
import { red } from '@mui/material/colors';
import NavBar from "./NavBar"
import Head from "next/head"
import { useTheme } from "next-themes";
import React from "react";

// Theme function to a color palette
const themes = createTheme({
    palette:{
        primary: {
          main: red[400],
        },
        secondary: {
            main: red[100],
        },
        info: {
            main: "#8B0000",
        }
    },
});

// React functional component to render each pages layout
const Layout = ({ children }) => {
    // Loads the theme and mounts to let the client know when the theme has been mounted onto the client
    const { theme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);

    // If the theme has not been mounted yet, do not render UI
    if (!mounted) return null;

    // Once the theme has been mounted, render the UI
    return (
        <ThemeProvider theme={themes}>
            <>
                <Head>
                    <title>Team 8 - Sprint 9</title>
                </Head>
                <div style={{display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: theme === "light" ? "#FFF4F4" : "#212121"}}>
                    <NavBar />
                    <main>{children}</main>
                    <footer style={{borderTop: theme === "light" ? "1px solid #E8E8E8" : "1px solid #3D3C3C", padding: "30px", marginTop: "auto"}}>
                        <div style={{display: "flex", justifyContent: "center", fontFamily: "Source Sans Pro", color: theme === "black" && "white"}}>
                            Copyright &copy; 2022 - Team 8
                        </div>
                    </footer>
                </div>
            </>
        </ThemeProvider>
    )
};

export default Layout;