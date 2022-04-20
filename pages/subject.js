import React, { useCallback } from 'react';
import Layout from "../components/Layout";
import {
    Autocomplete,Container, Grid, TextField, Button, Typography, Fade,
    InputLabel, MenuItem, FormControl, Select, CircularProgress,
} from "@mui/material";
import { useWidth } from "../context/WidthContext";
import axios from "axios";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import qs from "qs";
import ReactFlow, { Background, addEdge, useNodesState, useEdgesState } from 'react-flow-renderer';
import dagre from "dagre";
import { useTheme } from "next-themes";

// Function to make an API call to the server
async function graphAPI(searchSchool, searchTerm) {
    try {
        const { data } = await axios.get("/api/graph", {
            params: {
                term: searchTerm,
                school: searchSchool,
            }, paramsSerializer: params => {
                return qs.stringify(params);
            }
        });

        return data;
    } catch (error) {
      console.log(error);
      return {narr: [], earr:[]};
    }
}

async function getSubjectOptions(searchSchool) {
    try {
        const { data } = await axios.get("/api/getsubject", {
            params: {
                school: searchSchool,
            }, paramsSerializer: params => {
                return qs.stringify(params);
            }
        });

        return data;
    } catch (error) {
        console.log(error);
        return [];
    }
}

// React functional component that renders the graph degree pages
const Graph = () => {
    const { theme } = useTheme();
    const { width } = useWidth();

    // Values the user inputs
    const [searchTerm, setSearchTerm] = React.useState("");
    const [searchSchool, setSearchSchool] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false); 

    const [search, setSearch] = React.useState(false);
    const [error, setError] = React.useState("");
    const [cardName, setCardName] = React.useState([]);

    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    const nodeWidth = 172 * 2;
    const nodeHeight = 36;
    dagreGraph.setGraph({rankdir: 'LR'});

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const [ACOptions, setACOptions] = React.useState([]);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: true }, eds)),
        [setEdges]
    );

    const onOptionsChange = (event, value) => {
        value === null ? setSearchTerm("") : setSearchTerm(value);
    }

    const onInputValueChange = (event) => {
        if (event.target.value === undefined || event.target.value === null) {
            setSearchTerm("");
        } else {
            setSearchTerm(event.target.value);
        }
    }

    // Function that handles the change of the school
    const onSchoolChange = async (event) => {
        setError("");
        setSearchSchool("");
        setSearchTerm("");
        setSearchSchool(event.target.value);

        let options = [];

        if (event.target.value.length != 0) {
            options = await getSubjectOptions(event.target.value);
        }

        if (options !== null && options.length !== 0) {
            setACOptions(options.filter((e)=>{
                return (e != null);
            }));
        }
    }

    const addParentNodes = (redNodes, parents) => {
        let output = redNodes;

        nodes.forEach((child) => {
            if (parents.includes(child.id)) {
                redNodes = addParentNodes(redNodes, child.parents);
                output.push(child.id);
            }
        });

        return output;
    }

    const onNodeClick = (event, node) => {
        let output = []
        let redNodes = [];

        // get the list of red nodes
        nodes.forEach((n) => {
            if (n.id === node.id) {
                redNodes.push(node.id);
                redNodes = addParentNodes(redNodes, node.parents);
            }
        });

        // set the nodes in the red node list red
        output = nodes.map((n)=>{
            if (n.id.includes(" of")) {
                n = {...n, style:{...n.originalStyle}};
            } else if (redNodes.includes(n.id)) {
                n = {...n, style:{...n.style, backgroundColor: "red"}};
            }
            else {
                n = {...n, style:{...n.originalStyle}};
            }

            return n;
        });

        setNodes(output);
    }

    // Function that handles the search on click
    const handleSearch = async () => {
        // Various error check handlers
        if (searchSchool === "") {
            setError("Please choose a school");
            return;
        }

        if (searchTerm === "") {
            setError("Please enter a search term");
            return;
        }

        setIsLoading(true);
        const { degreeName, narr, earr } = await graphAPI(searchSchool, searchTerm);

        setIsLoading(false);

        narr.forEach((node) => {
            dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
        });

        earr.forEach((edge) => {
            dagreGraph.setEdge(edge.source, edge.target);
        });

        dagre.layout(dagreGraph);

        narr.forEach((node) => {
            const nodeWithPosition = dagreGraph.node(node.id);
            node.targetPosition = 'left';
            node.sourcePosition = 'right';

            // We are shifting the dagre node position (anchor=center center) to the top left
            // so it matches the React Flow node anchor point (top left).
            node.position = {
              x: nodeWithPosition.x - nodeWidth / 2,
              y: nodeWithPosition.y - nodeHeight / 2,
            };

            return node;
        });

        setNodes(narr);
        setEdges(earr);

        setCardName(degreeName);

        if (narr.length === 0) {
            setSearch(false);
        } else {
            setSearch(true);
        }

        setError("");
    }

    // Function that handles the clearing of the search filters
    const handleClearFilter = () => {
        setError("");
        setSearchSchool("");
        setSearchTerm("");
        setCardName("");
        setSearch(false);
    }

    return (
        <Layout>
            <Fade in={true} timeout={1000}>
                <Container maxWidth="xl">
                    <Grid container>
                        <Grid item xs={12} lg={width > 600 ? 6 : 12}
                        style={{
                            display:"flex",
                            flexDirection:"column",
                            alignItems: width > 600 ? "center" : "",
                            paddingBottom: "5%"
                        }}
                        >
                            <Typography variant="h5" sx={{ fontFamily: "Ubuntu", fontWeight: "bold", padding: width > 600 ? "3%" : "0%" }}>Search for Subjects to graph:</Typography>
                            {width <= 600 && <><br /><br /></>}
                            <div
                                style={{width:"50%"}}
                            >
                                <FormControl
                                    style={{width:"100%", backgroundColor: theme === "dark" && "#474646", borderRadius: "5px"}}
                                >
                                    <InputLabel sx={{ color: theme === "light" ? "#F16461" : "white", fontFamily: "Source Sans Pro", fontSize: "18px" }} id="school-dropdown">School</InputLabel>
                                    <Select
                                        labelId="school-dropdown"
                                        id="school-dropdown-select"
                                        value={searchSchool}
                                        label="School"
                                        onChange={onSchoolChange}
                                        sx={{color: theme === "light" ? "#F16461" : "white", fontFamily: "Source Sans Pro", fontSize: "18px"}}
                                    >
                                        <MenuItem sx={{fontFamily: "Source Sans Pro", fontSize: "18px"}} value="University of Guelph">University of Guelph</MenuItem>
                                        <MenuItem sx={{fontFamily: "Source Sans Pro", fontSize: "18px"}} value="University of British Columbia">University of British Columbia</MenuItem>
                                    </Select>
                                </FormControl>
                                {error !== "" ?
                                    <>
                                        <br />
                                        <br />

                                        <div style={{ display: "flex", flexDirection: "row" }}>
                                            <ErrorOutlineIcon sx={{ color: theme === "light" ? "red" : "#FA2D2D" }} />
                                            &nbsp;&nbsp;
                                            <Typography variant="subtitle1" sx={{ fontFamily: "Ubuntu", color: theme === "light" ? "red" : "#FA2D2D" }}>{error}</Typography>
                                        </div>
                                    </>
                                :
                                    <br />
                                }
                                <br/>
                                <FormControl>
                                    <br />
                                </FormControl>
                                <Autocomplete
                                    disablePortal
                                    freeSolo
                                    id="combo-box-demo"
                                    options={ACOptions}
                                    onChange={onOptionsChange}
                                    inputValue={searchTerm}
                                    onInputChange={onInputValueChange}
                                    renderInput={(params) => <TextField {...params} label="Search Term" sx={{borderRadius: "5px", backgroundColor: theme === "light" ? "dark" : "#474646", input: {color: theme === "light" ? "#F16461" : "white", fontFamily: "Source Sans Pro", fontSize: "18px"}}} InputLabelProps={{style: {color: theme === "light" ? "#F16461" : "white", fontFamily: "Source Sans Pro", fontSize: "18px"}}} />}
                                />
                                <br/>
                                <br/>
                                <Button onClick={handleClearFilter} variant="outlined" sx={{ fontFamily: "Source Sans Pro", fontWeight: "bold", fontSize: "16px" }}>Clear</Button>
                                &nbsp;&nbsp;&nbsp;
                                <Button onClick={handleSearch} variant="contained" sx={{ fontFamily: "Source Sans Pro", fontWeight: "bold", fontSize: "16px" }}>Search</Button>
                            </div>
                        </Grid>

                        <Grid item xs={12} lg={6}>
                            {isLoading ?
                                <CircularProgress size={60} thickness={10} />
                                :
                                <>
                                    {width <= 1200 && <br />}
                                    <Typography variant='h6' sx={{fontFamily: "Source Sans Pro", fontSize: "23px"}} >{cardName}</Typography>
                                    {search === true && (
                                        <div id="graphArea" style={{width: "100%"}}>
                                            <ReactFlow
                                                fitView
                                                maxZoom={1}
                                                minZoom={0}
                                                nodes={nodes}
                                                edges={edges}
                                                onNodesChange={onNodesChange}
                                                onEdgesChange={onEdgesChange}
                                                onConnect={onConnect}
                                                nodesDraggable={false}
                                                onNodeClick={onNodeClick}
                                                connectionLineType="smoothstep"
                                                style={
                                                    {
                                                        height: "65vh",
                                                        border: "1px red solid"
                                                    }
                                                }
                                            >
                                                <Background variant="dots" gap={24} size={0.5}/>
                                            </ReactFlow>
                                        </div>
                                    )}
                                    </>
                            }
                        </Grid>

                        {width < 1200 && <Grid item xs={12}><br /><br /></Grid>}
                    </Grid>
                </Container>
            </Fade>
        </Layout>
    )
}

export default Graph;
