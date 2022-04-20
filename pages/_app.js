// This file allows for the hidden app file in NextJS to be modified
import WidthContextProvider from "../context/WidthContext";
import { ThemeProvider } from "next-themes";
import "../styles/global.css";

// Component that allows for a custom app that is hidden in NextJS
const Application = ({ Component, pageProps }) => (
    // Wraps all pages and children component in the WidthContextProvider so every page has access to the Width context
    <WidthContextProvider>
        <ThemeProvider enableSystem={false} >
            <Component {...pageProps} />
        </ThemeProvider>
    </WidthContextProvider>
)

export default Application;