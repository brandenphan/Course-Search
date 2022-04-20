import React from "react";

// Creates a context and a function to export the contexts information
const WidthContext = React.createContext();
export const useWidth = () => React.useContext(WidthContext);

// Creates a WidthContextProvider, all children of this provider have access to the contexts value
const WidthContextProvider = ({ children }) => {
    // Creates a width state and a function to update the state
    const [width, setWindowWidth] = React.useState(0);
    const [height, setWindowHeight] = React.useState(0);
    const updateDimensions = () => {
        setWindowWidth(window.innerWidth);
        setWindowHeight(window.innerHeight);
    };

    // Effect hook that mounts the initial width, and remounts each time the width is updated calling the updateDimensions function
    React.useEffect(() => {
        updateDimensions();
        window.addEventListener("resize", updateDimensions, { passive: true });
        return () => {
            window.removeEventListener("resize", updateDimensions);
        };
    }, []);

    // Sets the value and returns it with the WidthContext
    const value = { width, height };
    return (
        <WidthContext.Provider value={value}>{children}</WidthContext.Provider>
    );
};

export default WidthContextProvider;
