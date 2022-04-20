import React from "react";
import Layout from "../components/Layout";
import { Typography, Grid, Fade } from "@mui/material";
import { useWidth } from "../context/WidthContext";

const Welcome = () => {
    const { width } = useWidth();

    return (
        <Layout>
            <Fade in={true} timeout={1000}>
                <Grid container sx={{ paddingLeft: "4%", paddingRight: "4%" }}>
                    <Grid item xs={12}>
                        <Typography color="primary" align={"center"} variant="h4" sx={{ fontFamily: "Ubuntu", marginLeft: width > 800 ? "4%" : "0%" }}>Course Information</Typography>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography align={"center"} variant="h6" sx={{ fontFamily: "Inter", fontWeight: 300, marginLeft: width > 800 ? "4%" : "0%" }}>Developers: Branden, Dan, Greg, JingJing, Yingjie</Typography>
                        <br />
                        <br />
                    </Grid>

                    {width > 800 && <Grid item xs={2} />}
                    <Grid item xs={width > 800 ? 4 : 12}>
                        <Typography color="primary" variant="h6" sx={{ fontFamily: "Source Sans Pro", marginLeft: width > 800 ? "6%" : "4%" }}>Our website features:</Typography>
                        <ul style={{ marginLeft: width > 800 ? "7%" : "4%" }}>
                            {["Fully functional NavBar", "Search for University of Guelph Courses", "Displaying UofG/UBC prerequisite tree graphs by degrees", "Displaying UofG/UBC prerequisite tree graphs by subject", "Light/Dark Mode", "Various UX components (load animations, errors, etc)", "Fully responsive design", "Cross-browser support"].map((instance, ID) => (
                                <div key={ID}>
                                    <li style={{ fontFamily: "Source Sans Pro", fontSize: "18px" }}>{instance}</li>
                                    <br />
                                </div>
                            ))}
                        </ul>
                    </Grid>

                    {width > 800 && <Grid item xs={2} />}
                    <Grid item xs={width > 800 ? 3 : 12}>
                        <Typography color="primary" variant="h6" sx={{ fontFamily: "Source Sans Pro", marginLeft: width > 800 ? "6%" : "4%" }}>Technology stack:</Typography>
                        <ul style={{ marginLeft: width > 800 ? "7%" : "4%" }}>
                            {["Next JS", "React front-end", "Next back-end", "Material UI", "React Flow", "Axios", "Playwright JS", "NGINX", "PM2", "apt."].map((instance, ID) => (
                                <div key={ID}>
                                    <li style={{ fontFamily: "Source Sans Pro", fontSize: "18px" }}>{instance}</li>
                                    <br />
                                </div>
                            ))}
                        </ul>
                        <br />
                    </Grid>
                    {width > 800 && <Grid item xs={1} />}
                </Grid>
            </Fade>
        </Layout>
    )
}

export default Welcome;