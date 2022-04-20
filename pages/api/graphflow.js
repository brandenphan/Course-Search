import qs from "qs";
import { load } from '../../src/util.js';
import _ from "lodash";
import {
    searchMajor, searchMajorName, searchMinor, searchMinorName, searchCourseByName,
} from "../../src/coursesearch";

/**
 * Gets courses for a given major or minor
 *
 * @param {String} programCode - Major or Minor code
 * @param {Array} courses - Array of JSON course data
 * @param {String} graphType - Whether to make a graph of a major or minor
 *
 * @returns {Array} Array of courses for the given major or minor
 */
const getCourses = (programCode, courses, graphType) => {
    let result;

    if (graphType === 'Major') {
      result = searchMajor(courses, programCode);

      if (Object.keys(result).length === 0) {
        result = searchMajorName(courses, programCode);
      }
    } else if (graphType === 'Minor') {
      result = searchMinor(courses, programCode);

      if (Object.keys(result).length === 0) {
        result = searchMinorName(courses, programCode);
      }
    }

    return result;
}

const getCoursePrereqs = (school, coursesJSON, course) => {
    let trimCourse = course.replace(/[^\w\s]/gi, '');

    if (school === "University of Guelph") {
        trimCourse = course;
    }

    const result = searchCourseByName(coursesJSON, trimCourse);

    if (result === null) {
        return [];
    }

    if (school === "University of Guelph") {
        return result.CoursePrerequisite;
    }

    let prereqs = [];
    coursesJSON.forEach((course2) => {
        if (result != null && result.CoursePrerequisite.includes(course2.CourseCode)) {
            prereqs.push(course2.CourseCode);
        }
    });

    return prereqs;
}

const setNodeStyle = (courseName) => {
    let nodeColor = "#035afc";

    if (courseName.includes("*1") || courseName.includes(" 1")) {
        nodeColor = "#ff08d6";
    } else if (courseName.includes("*2") || courseName.includes(" 2")) {
        nodeColor = "#de08ff";
    } else if (courseName.includes("*3") || courseName.includes(" 3")) {
        nodeColor = "#9808ff";
    } else if (courseName.includes("*4") || courseName.includes(" 4")) {
        nodeColor = "#5a08ff";
    }

    const borderColor = nodeColor;
    const style = {
        color: "white",
        fontWeight: "bold",
        fontFamily: "Ubuntu",
        fontSize: "1.5rem",
        backgroundColor: nodeColor,
        border: "1px solid",
        borderColor: borderColor,
        width: courseName.length*21
    };

    return style;
}

const setGraphNodes = (school, coursesJSON, courses) => {
    const position = { x: 0, y: 0 };
    const nodes = [];

    courses.forEach( (course) => {
        if (course === "") {
            return;
        }

        const node = {
            id: '',
            data: { label: '', prereqs: [] },
            style: {},
            originalStyle: {},
            position,
            parents: []
        };

        node.id = course;
        node.data.label = course;
        node.data.prereqs = getCoursePrereqs(school, coursesJSON, course);
        node.style = setNodeStyle(node.data.label);
        node.originalStyle = node.style;

        nodes.push(node);
    });

    return nodes;
};

const setGraphEdges = (nodes) => {
  let edges = [];

  nodes.forEach((course) => {
    course.data.prereqs.forEach((prereq) => {
      nodes.forEach((course2) => {
        if (prereq.includes(course2.data.label)) {
          addGraphEdges(course2.data.label,course.data.label,edges);
        }
      });

    });
  });

  return edges;
};

const addGraphEdges = (source,target,edges) => {
    if (source === "") {
        return;
    }

    const i = edges.length;
    const edgeType = 'simplebezier';
    const edge = {
        id: 'e' + i,
        source: source,
        target: target,
        type: edgeType,
        animated: false
    };

    edges.push(edge);

    return edge;
};

const setParentNodes = (nodes) => {
    nodes.forEach((child) => {
        nodes.forEach((parent) => {
            parent.data.prereqs.forEach((prereq) => {
              if (prereq.includes(child.id)) {
                child.parents.push(parent.id);
              }
            });
        });
    });
}

const handler = async (req, res) => {
    const { method } = req;
    const result = {
        degreeName: "",
        narr: [],
        earr: []
    };

    const params = qs.parse(req.query);
    let term = params.term.toUpperCase();
    let graphType = params.graphType;
    let school = params.school;
    let courseFile;
    let degreeFile;

    if (school === "University of Guelph") {
        courseFile = './data/ScrapedGuelphCourses.json';
        degreeFile = './data/GuelphMajorCourses.json';
    }
    else if (school === "University of British Columbia") {
        courseFile = './data/ScrapedUBCCourses.json';
        degreeFile = './data/UBCMajorCourses.json';
    }

    let coursesJSON = await load(courseFile);
    let degrees = await load(degreeFile);

    if (school === "University of Guelph") {
        if (graphType === "Major" || graphType === "Minor") {
            const degree = getCourses(term, degrees, graphType);

            if (_.isEmpty(degree)) {
                result["degreeName"] = "No Results found. Check your spelling and try again."
                result.narr = [];
            } else if (graphType === "Major") {
                if (degree.degreeName != null) {
                    result["degreeName"] = degree.degreeName + " " + degree.programName;
                } else {
                    result["degreeName"] = degree.programName;
                }
                result.narr = setGraphNodes(school, coursesJSON, degree.majorInformation.courses);
            } else if (graphType === "Minor") {
                if (degree.degreeName != null) {
                    result["degreeName"] = degree.degreeName + " " + degree.programName;
                } else {
                    result["degreeName"] = degree.programName;
                }
                result.narr = setGraphNodes(school, coursesJSON, degree.minorInformation.courses);
            }

            result.earr = setGraphEdges(result.narr);
            setParentNodes(result.narr);
        }
    } else if (school === "University of British Columbia") {
        if (graphType === "Major") {
            let degree = {};

            degrees.forEach((JSON) => {
                if (JSON.programName.toLowerCase() === term.toLowerCase())
                {degree = JSON;}
            });

            if (_.isEmpty(degree)) {
                result["degreeName"] = "No Results found. Check your spelling and try again."
                result.narr = [];
            } else {
                if (degree.degreeName != null) {
                    result["degreeName"] = degree.degreeName + " " + degree.programName;
                } else {
                    result["degreeName"] = degree.programName;
                }
                result.narr = setGraphNodes(school, coursesJSON, degree.majorInformation.courses);
            }

            result.earr = setGraphEdges(result.narr);
            setParentNodes(result.narr);
        } else {
            result['degreeName'] = graphType + " graphs for " + school +" are not currently supported. Try a Major!";
        }
    }

    try {
        if (method === "GET") {
            return res.status(200).json(result);
        } else if (method === "POST") {
            return res.status(201).json({});
        } else {
                return res.status(404).json("Method unsupported");
        }
    } catch (error) {
        return res.status(400).json(error);
    }
};

export default handler;
