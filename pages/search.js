import React from "react";
import Layout from "../components/Layout";
import {
    Dialog, Card, CardActions, CardContent, Grid, TextField, Button, Typography, Fade, Box, FormControl,
    Select, MenuItem, InputLabel, List, Radio, RadioGroup, FormLabel, FormControlLabel, ListItemText,
    CircularProgress, Pagination, Container,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useWidth } from "../context/WidthContext";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import axios from "axios";
import qs from "qs";
import { useTheme } from "next-themes";

// Function to make an API call to the server
async function searchAPI(filterArray) {
    try {
        // Sends a get request to the /api/search with the inputted filters from the user
        // paramsSerializer to serialize the parameters as an array of filters is being sent through the get request
        const { data } = await axios.get("/api/search", {
            params: {
                filters: filterArray,
            }, paramsSerializer: params => {
                return qs.stringify(params);
            }
        });

        // Returns the data received from the get request once the promise has resolved
        return data;
    } catch (error) {
        return [];
    }
}

// React functional component that renders the Search page
const Search = () => {
    // Width context holding the current width of the screen in pixels and theme context holding the light/dark mode value
    const { width } = useWidth();
    const { theme } = useTheme();

    // State hook handling errors, dataSearched, loading, and pagination
    const [error, setError] = React.useState("");
    const [dataSearched, setDataSearched] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [pagination, setPagination] = React.useState(1);
    const [perPage, setPerPage] = React.useState(10);

    // State hook that handle the current filter the user is viewing and all the filters the user has inputted
    const [filters, setFilters] = React.useState("");
    const [filterArray, setFilterArray] = React.useState([]);
    const [courses, setCourses] = React.useState([]);

    // State hooks that handle the different filter values
    const [courseCode, setCourseCode] = React.useState("");
    const [courseName, setCourseName] = React.useState("");
    const [season, setSeason] = React.useState("");
    const [weightValue, setWeightValue] = React.useState("");

    // Function that handles the search on click
    const handleSearch = async () => {
        setDataSearched(true);
        setIsLoading(true);
        const courseArray = await searchAPI(filterArray);
        setCourses(courseArray);
        setIsLoading(false);
    }

    // Function that handles adding filters - includes the adding and error checking of filters
    const handleAdd = async () => {
        if (filters === "Course Code") {
            if (courseCode === "") {
                setError("Please enter a course code");
                setCourseCode("");
                return;
            }

            let duplicate = false;
            filterArray.forEach((currentFilter) => {
                if (currentFilter.input.toLowerCase() === courseCode.toLowerCase() && currentFilter.filter === "CourseCode") {
                    duplicate = true;
                }
            })

            if (duplicate === true) {
                setError("The course code is already in the filters");
            } else {
                setFilterArray(oldArray => [...oldArray, { display: "Code:", input: courseCode,  filter: "CourseCode"}]);
                setError("");
            }

            setCourseCode("");
        }

        else if (filters === "Course Name") {
            if (courseName === "") {
                setError("Please enter a course name");
                setCourseName("");
                return;
            }

            let duplicate = false;
            filterArray.forEach((currentFilter) => {
                if (currentFilter.input.toLowerCase() === courseName.toLowerCase() && currentFilter.filter === "CourseName") {
                    duplicate = true;
                }
            })

            if (duplicate === true) {
                setError("This course name is already in the filters");
            } else {
                setFilterArray(oldArray => [...oldArray, { display: "Name:", input: courseName, filter: "CourseName"}]);
                setError("");
            }

            setCourseName("");
        }

        else if (filters === "Season") {
            if (season === "") {
                setError("Please select a season");
                setSeason("");
                return;
            }

            let duplicate = false;
            filterArray.forEach((currentFilter) => {
                if (currentFilter.input === season && currentFilter.filter === "CourseSeasons") {
                    duplicate = true;
                }
            })

            if (duplicate === true) {
                setError("This season is already in the filters");
            } else {
                setFilterArray(oldArray => [...oldArray, { display: "Season:", input: season, filter: "CourseSeasons"}]);
                setError("");
            }

            setSeason("");
        }

        else if (filters === "Weight") {
            if (weightValue === "") {
                setError("Please select a course weight");
                setWeightValue("");

                return;
            }

            let duplicate = false;
            filterArray.forEach((currentFilter) => {
                if (currentFilter.input === weightValue && currentFilter.filter === "CourseWeight") {
                    duplicate = true;
                } 
            })

            if (duplicate === true) {
                setError("This weight is already in the filters");
            } else {
                setFilterArray(oldArray => [...oldArray, { display: "Weight:", input: weightValue, filter: "CourseWeight"}]);
                setError("");
            }
            setWeightValue("");
        }
    }

    // Function that handles the removal of a filter
    const handleRemove = (e) => {
        // Creates a new array by filtering the current filterArray, removing the filter chosen by the user
        const newArray = filterArray.filter((currentFilter) => {
            if (currentFilter.filter !== e.currentTarget.id || currentFilter.input !== e.currentTarget.value) {
                return currentFilter;
            } else {
                return;
            }
        });

        setFilterArray(newArray);
    }


    // Function that handles the change in filter type
    const handleFilters = (event) => {
        setCourseCode("");
        setCourseName("");
        setSeason("");
        setWeightValue("");
        setError("");
        setFilters(event.target.value);
    }

    // Function that handles clearing all filters
    const handleClearFilter = () => {
        setError("");
        setFilters("");
        setFilterArray([]);
        setCourseCode("");
        setCourseName("");
        setSeason("");
        setWeightValue("");
        setCourses([]);
        setDataSearched(false);
    }


    // Function that handles the change in course code value inside the textfield
    const handleCourseCodeChange = (event) => {
        setCourseCode(event.target.value);
    }

    // Function that handles the change in course name value inside the textfield
    const handleCourseNameChange = (event) => {
        setCourseName(event.target.value);
    }

    // Function that handles the user clicking one of the season buttons
    const handleSeason = (event) => {
        setSeason(event.target.value);
    }

    // Function that handles the user choosing a course weight
    const handleWeight = (event) => {
        setWeightValue(event.target.value);
    }

    // Returns JSX to render the Search page
    return (
        <Layout>
            <Fade in={true} timeout={1000}>
                <Container maxWidth="xl">
                    <Grid container>
                        <Grid item xs={width > 1000 ? 3 : 12}>
                            <br />
                            <Typography variant="h5" sx={{ fontFamily: "Ubuntu", fontWeight: "bold" }}>Filters</Typography>
                            <br />
                            <Box sx={{ minWidth: 50, maxWidth: width > 1500 ? 300 : 225 }}>
                                <FormControl fullWidth sx={{backgroundColor: theme === "dark" && "#474646", borderRadius: "5px"}}>
                                    <InputLabel sx={{color: theme === "light" ? "#F16461" : "white", fontFamily: "Source Sans Pro", fontSize: "18px"}}>Filters:</InputLabel>
                                    <Select color="primary" value={filters} label="Filters" onChange={handleFilters} sx={{color: theme === "light" ? "#F16461" : "white", fontFamily: "Source Sans Pro", fontSize: "18px"}}>
                                        <MenuItem sx={{fontFamily: "Source Sans Pro", fontSize: "18px"}} value="Course Code">Course Code</MenuItem>
                                        <MenuItem sx={{fontFamily: "Source Sans Pro", fontSize: "18px"}} value="Course Name">Course Name</MenuItem>
                                        <MenuItem sx={{fontFamily: "Source Sans Pro", fontSize: "18px"}} value="Season">Season</MenuItem>
                                        <MenuItem sx={{fontFamily: "Source Sans Pro", fontSize: "18px"}} value="Weight">Weight</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>

                            {filters !== "" && <br />} 
                            {error !== "" &&
                                <>
                                    <div style={{ display: "flex", flexDirection: "row" }}>
                                        <ErrorOutlineIcon sx={{ color: theme === "light" ? "red" : "#FA2D2D" }} />
                                        &nbsp;&nbsp;
                                        <Typography variant="subtitle1" sx={{ fontFamily: "Ubuntu", color: theme === "light" ? "red" : "#FA2D2D" }}>{error}</Typography>
                                    </div>
                                    <br />
                                </>
                            }
                            {filters === "Course Code" && <TextField label="Enter Course Code" onChange={handleCourseCodeChange} value={courseCode} sx={{borderRadius: "5px", backgroundColor: theme === "light" ? "dark" : "#474646", input: {color: theme === "light" ? "#F16461" : "white", fontFamily: "Source Sans Pro", fontSize: "18px"}}} InputLabelProps={{style: {color: theme === "light" ? "#F16461" : "white", fontFamily: "Source Sans Pro", fontSize: "18px"}}} />}
                            {filters === "Course Name" && <TextField label="Enter Course Name" onChange={handleCourseNameChange} value={courseName} sx={{borderRadius: "5px", backgroundColor: theme === "light" ? "dark" : "#474646", input: {color: theme === "light" ? "#F16461" : "white", fontFamily: "Source Sans Pro", fontSize: "18px"}}} InputLabelProps={{style: {color: theme === "light" ? "#F16461" : "white", fontFamily: "Source Sans Pro", fontSize: "18px"}}} />}
                            {filters === "Season" && 
                                <FormControl>
                                    <FormLabel sx={{color: theme === "light" ? "#F16461" : "white", fontFamily: "Ubuntu"}}>Seasons</FormLabel>
                                    <RadioGroup row onChange={handleSeason} value={season} >
                                        <FormControlLabel value="Fall" control={<Radio sx={{color: theme === "dark" && "white"}} />} label={<Typography sx={{fontFamily: "Source Sans Pro", fontSize: "18px"}}>Fall</Typography>} />
                                        <FormControlLabel value="Winter" control={<Radio sx={{color: theme === "dark" && "white"}} />} label={<Typography sx={{fontFamily: "Source Sans Pro", fontSize: "18px"}}>Winter</Typography>} />
                                        <FormControlLabel value="Summer" control={<Radio sx={{color: theme === "dark" && "white"}} />} label={<Typography sx={{fontFamily: "Source Sans Pro", fontSize: "18px"}}>Summer</Typography>} />
                                    </RadioGroup>
                                </FormControl>
                            }
                            {filters === "Weight" &&     
                                <Box sx={{ minWidth: 50, maxWidth: 200 }}>
                                    <FormControl fullWidth sx={{backgroundColor: theme === "dark" && "#474646", borderRadius: "5px"}} >
                                        <InputLabel sx={{color: theme === "light" ? "#F16461" : "white", fontFamily: "Source Sans Pro", fontSize: "18px"}}>Weight</InputLabel>
                                            <Select value={weightValue} label="Weight" onChange={handleWeight} sx={{color: theme === "light" ? "#F16461" : "white", fontFamily: "Source Sans Pro"}}>
                                                <MenuItem sx={{fontFamily: "Source Sans Pro", fontSize: "18px"}} value="0.25">0.25</MenuItem>
                                                <MenuItem sx={{fontFamily: "Source Sans Pro", fontSize: "18px"}} value="0.5">0.5</MenuItem>
                                                <MenuItem sx={{fontFamily: "Source Sans Pro", fontSize: "18px"}} value="0.75">0.75</MenuItem>
                                                <MenuItem sx={{fontFamily: "Source Sans Pro", fontSize: "18px"}} value="1">1</MenuItem>
                                            </Select>
                                    </FormControl>
                                </Box>
                            }
                            {filters !== "" && (
                                <>
                                    <Grid item xs={12}><br /></Grid>
                                    <Grid item xs={12}>
                                        <Button onClick={handleClearFilter} variant="outlined" sx={{ fontFamily: "Source Sans Pro", fontWeight: "bold", fontSize: "16px" }}>Clear</Button>
                                        &nbsp;&nbsp;&nbsp;
                                        <Button onClick={handleAdd} variant="contained" sx={{ fontFamily: "Source Sans Pro", fontWeight: "bold", fontSize: "16px" }}>Add</Button>
                                    </Grid>
                                </>
                            )}
                        </Grid>

                        {width <= 1000 && 
                            <Grid item xs={12} sm={12}>
                                <br />
                                <br />
                                <br />
                                <Typography variant="h5" sx={{ fontFamily: "Ubuntu", fontWeight: "bold" }}>Current Filters</Typography>
                                <br />
                                <List sx={{ width: '100%', maxWidth: 360, bgcolor: theme === "light" ? '#FFD8D8' : "#474646", borderRadius: "5px" }}>
                                    {filterArray.length === 0 ? 
                                        <ListItemText disableTypography primary={<Typography sx={{fontFamily: "Source Sans Pro", fontSize: "18px"}}>No Filters Added</Typography>} sx={{ marginLeft: "6%" }} />
                                    : 
                                        filterArray.map((instance, ID) => (
                                            <div key={ID} style={{ display: "flex", flexDirection: "row", alignContent: "center" }}>
                                                <Button onClick={handleRemove} id={instance.filter} value={instance.input} fullWidth sx={{ color: "black", textTransform: "none" }}>
                                                    <div style={{ display: "flex", justifyContent: "center", alignContent: "center" }}>
                                                        <CloseIcon sx={{color: theme === "light" ? "black" : "white"}} />
                                                    </div>
                                                    <ListItemText disableTypography primary={<Typography sx={{fontFamily: "Source Sans Pro", fontSize: "18px"}}>{instance.display}</Typography>} sx={{color: theme === "light" ? "black" : "white"}} />
                                                    <ListItemText disableTypography primary={<Typography sx={{fontFamily: "Source Sans Pro", fontSize: "18px"}}>{instance.input}</Typography>} sx={{color: theme === "light" ? "black" : "white"}} />
                                                </Button>
                                            </div>
                                        ))
                                    }
                                </List>
                                {filterArray.length !== 0 && 
                                    <>
                                        <br />
                                        <Button onClick={handleSearch} variant="contained" sx={{ fontFamily: "Source Sans Pro", fontWeight: "bold", fontSize: "16px" }}>Search</Button>
                                    </>
                                }
                                <br />
                                <br />
                                <br />
                            </Grid>
                        }

                        <Grid item xs={12} sm={width > 1000 ? 6 : 12}>
                            {dataSearched === true &&
                            <Fade in={true} timeout={1000}>
                                <Grid container>
                                    <Grid item xs={11}>
                                        <br />
                                        <Typography variant="h5" align="left" sx={{ fontFamily: "Ubuntu", fontWeight: "bold" }}>Results</Typography>
                                        <br />
                                    </Grid>

                                    {isLoading === true ? 
                                        <>
                                            <Grid item xs={1} />
                                            <Grid item xs={width > 500 ? 11 : 10}>
                                                <CircularProgress size={60} thickness={10} />
                                            </Grid>
                                            {width <= 500 && <Grid item xs={1} />}
                                        </>
                                    :
                                        courses.length === 0 ? 
                                            <>
                                                <Grid item xs={1} />
                                                <Grid item xs={width > 500 ? 11 : 10}>
                                                    <Typography variant="subtitle1" sx={{ fontFamily: "Ubuntu", color: "red" }}>No courses match the filters</Typography>
                                                </Grid>
                                                {width <= 500 && <Grid item xs={1} />}
                                            </>
                                        :
                                            courses.slice((pagination - 1) * perPage, (pagination - 1) * perPage + perPage).map((course, ID) => (
                                                <CourseComponent course={course} width={width} key={ID} theme={theme} />
                                            ))
                                    }
                                    {courses.length !== 0 &&
                                    <Container sx={{ display: "flex", justifyContent: "center", marginBottom: "25px", marginTop: "15px" }}>
                                        <Pagination
                                            color="primary"
                                            count={Math.floor(courses.length / perPage) + 1}
                                            onChange={(e, page) => setPagination(page)}
                                            sx={{"& .MuiPaginationItem-root": {color: theme === "dark" && "white"}}}
                                        />
                                    </Container>
                                    }
                                </Grid>
                            </Fade>
                        }
                        </Grid>

                        {width > 1000 &&
                            <Grid item xs={12} sm={3}>
                                <br />
                                <Typography variant="h5" sx={{ fontFamily: "Ubuntu", fontWeight: "bold" }}>Current Filters</Typography>
                                <br />
                                <List sx={{ width: '100%', maxWidth: 360, bgcolor: theme === "light" ? '#FFD8D8' : "#474646", borderRadius: "5px" }}>
                                    {filterArray.length === 0 ? 
                                        <ListItemText disableTypography primary={<Typography sx={{fontFamily: "Source Sans Pro", fontSize: "18px"}}>No Filters Added</Typography>} sx={{ marginLeft: "6%" }} />
                                    : 
                                        filterArray.map((instance, ID) => (
                                            <div key={ID} style={{ display: "flex", flexDirection: "row", alignContent: "center" }}>
                                                <Button onClick={handleRemove} id={instance.filter} value={instance.input} fullWidth sx={{ color: "black", textTransform: "none" }}>
                                                    <div style={{ display: "flex", justifyContent: "center", alignContent: "center" }}>
                                                        <CloseIcon sx={{color: theme === "light" ? "black" : "white"}} />
                                                    </div>
                                                    <ListItemText disableTypography primary={<Typography sx={{fontFamily: "Source Sans Pro", fontSize: "18px"}}>{instance.display}</Typography>} sx={{color: theme === "light" ? "black" : "white"}} />
                                                    <ListItemText disableTypography primary={<Typography sx={{fontFamily: "Source Sans Pro", fontSize: "18px"}}>{instance.input}</Typography>} sx={{color: theme === "light" ? "black" : "white"}} />
                                                </Button>
                                            </div>
                                        ))
                                    }
                                </List>
                                {filterArray.length !== 0 && 
                                    <>
                                        <br />
                                        <Button onClick={handleSearch} variant="contained" sx={{ fontFamily: "Source Sans Pro", fontWeight: "bold", fontSize: "16px" }}>Search</Button>
                                    </>
                                }
                            </Grid>
                        }
                    </Grid>
                </Container>
            </Fade>
        </Layout>
    )
}

export default Search;

// Functional Component that loads course cards
const CourseComponent = ({ course, width, theme }) => {
    // Dialog state
    const [open, setOpen] = React.useState(false);

    // Functions to handle the opening and closing of the dialog component
    const handleCourseOpen = () => {
        setOpen(true);
    }

    const handleCourseClose = () => {
        setOpen(false);
    }

    return (
        <>
            <Grid item xs={1} />
            <Grid item xs={width > 500 ? 11 : 10}>
                <Card sx={{backgroundColor: theme === "dark" && "#474646"}}>
                    <CardContent>
                        <Typography variant="h5" component="div" sx={{ color: theme === "dark" ? "white" : "black", fontFamily: "Inter", fontWeight: 400 }}>
                            {course.CourseCode}
                        </Typography>
                        <Typography sx={{ fontSize: 14, color: theme === "dark" ? "#D7D7D7" : "black", fontFamily: "Inter", fontWeight: 400 }} color="text.secondary" gutterBottom>
                            Name: {course.CourseName}
                        </Typography>
                        <Typography sx={{ fontSize: 14, color: theme === "dark" ? "#D7D7D7" : "black", fontFamily: "Inter", fontWeight: 400 }} color="text.secondary" gutterBottom>
                            Weight: {course.CourseWeight}
                        </Typography>
                        {course.CourseRestriction != "" &&
                        <br/> &&
                        <Typography sx={{ fontSize: 14, color: theme === "dark" ? "#D2A400" : "#964B00", fontFamily: "Inter", fontWeight: 400 }} color="text.secondary" gutterBottom>
                            Restrictions: {course.CourseRestriction}
                        </Typography>}
                    </CardContent>
                    <CardActions>
                        <Button onClick={handleCourseOpen} size="medium" sx={{ textTransform: "capitalize", fontFamily: "Inter", fontWeight: 400 }}>See more</Button>
                    </CardActions>

                    <Dialog
                        open={open}
                        onClose={handleCourseClose}
                    >
                        <Card sx={{backgroundColor: theme === "dark" && "#474646"}}>
                            <CardContent>
                                <Typography variant="h5" component="div" sx={{ color: theme === "dark" ? "white" : "black", fontFamily: "Inter", fontWeight: 400 }}>
                                    {course.CourseCode}
                                </Typography>
                                <Typography sx={{ fontSize: 14, marginTop: "2%", color: theme === "dark" ? "#D7D7D7" : "black", fontFamily: "Inter", fontWeight: 400  }} color="text.secondary" gutterBottom>
                                    Name: {course.CourseName}
                                </Typography>
                                <Typography sx={{ fontSize: 14, color: theme === "dark" ? "#D7D7D7" : "black", fontFamily: "Inter", fontWeight: 400 }} color="text.secondary" gutterBottom>
                                    Weight: {course.CourseWeight}
                                </Typography>
                                <Typography sx={{ fontSize: 14, color: theme === "dark" ? "#D7D7D7" : "black", fontFamily: "Inter", fontWeight: 400 }} color="text.secondary" gutterBottom>
                                    {course.CourseSeasons}
                                </Typography>
                                {course.CourseLectures !== "" &&
                                <Typography sx={{ fontSize: 14, color: theme === "dark" ? "#D7D7D7" : "black", fontFamily: "Inter", fontWeight: 400 }} color="text.secondary" gutterBottom>
                                    {course.CourseLectures}
                                </Typography>}
                                {course.CourseOffering !== "" &&
                                <Typography sx={{ fontSize: 14, color: theme === "dark" ? "#D7D7D7" : "black", fontFamily: "Inter", fontWeight: 400 }} color="text.secondary" gutterBottom>
                                    {course.CourseOffering}
                                </Typography>}
                                {course.CoursePrerequisite.length !== 0 &&
                                <Typography sx={{ fontSize: 14, color: theme === "dark" ? "#D2A400" : "#964B00", fontFamily: "Inter", fontWeight: 400 }} color="text.secondary" gutterBottom>
                                    Prerequisite(s):&nbsp;
                                    {course.CoursePrerequisite.map((prerequisite, index, prerequisiteArray) => {
                                        if (index === prerequisiteArray.length - 1) {
                                            return prerequisite;
                                        }
                                        else {
                                            return prerequisite + ", ";
                                        }
                                    })}
                                </Typography>}
                                {course.CourseEquate !== "" &&
                                <Typography sx={{ fontSize: 14, color: theme === "dark" ? "#D2A400" : "#964B00", fontFamily: "Inter", fontWeight: 400 }} color="text.secondary" gutterBottom>
                                    Equate(s): {course.CourseEquate}
                                </Typography>}
                                {course.CourseDepartment !== [] &&
                                <Typography sx={{ fontSize: 14, color: theme === "dark" ? "#D7D7D7" : "black", fontFamily: "Inter", fontWeight: 400 }} color="text.secondary" gutterBottom>
                                    Department: {course.CourseDepartment}
                                </Typography>}
                                <Typography sx={{ fontSize: 14, color: theme === "dark" ? "#D7D7D7" : "black",fontFamily: "Inter", fontWeight: 400 }} color="text.secondary" gutterBottom>
                                    Location: {course.CourseLocation}
                                </Typography>
                                {course.CourseRestriction !== "" &&
                                <Typography sx={{ fontSize: 14, color: theme === "dark" ? "#D2A400" : "#964B00", fontFamily: "Inter", fontWeight: 400 }} color="text.secondary" gutterBottom>
                                    Restrictions: {course.CourseRestriction}
                                </Typography>}
                                <br/>
                                {course.CourseDescription !== "" &&
                                <Typography sx={{ fontSize: 14, color: theme === "dark" ? "#D7D7D7" : "black", fontFamily: "Inter", fontWeight: 400 }} gutterBottom>
                                    {course.CourseDescription}
                                </Typography>}
                            </CardContent>
                        </Card>
                    </Dialog>
                </Card>
                <br/>
            </Grid>
            {width <= 500 && <Grid item xs={1} />}
        </>
    )  
};
