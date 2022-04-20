import qs from "qs";
import { load } from '../../src/util.js';
import _ from "lodash";
import { searchCourseMultiValue } from "../../src/coursesearch";
import { removeItem, getSubject, searchWord, checkCourseEligible } from "../../src/coursesearch";

/**
 * Determines if there is an edge between two nodes
 * @param {Node} node1
 * @param {Node} node2
 * @param {Digraph} g
 * @returns True if there is an edge between node1 and node2
 */
export function nodesConnected(node1, node2, connect) {

  for (let i = 0; i < connect.length; i += 1) {
    const nodeOne = connect[i].source.trim();
    const nodeTwo = connect[i].target.trim();

    if ((nodeOne.localeCompare(node1) === 0 && nodeTwo.localeCompare(node2) === 0)
      || (nodeTwo.localeCompare(node1) === 0 && nodeOne.localeCompare(node2) === 0)) {
      return true; // if true, return yes
    }
  }

  return false;
}

/**
 * Checks for the existence of a node in the digraph
 * @param {Node} node
 * @param {Digraph} g
 * @returns True if exists, False if does not exist
 */
function nodeExist(node, nodes) {
  for (var i = 0; i < nodes.length; i++) {
    const tempNodes = nodes[i].id;

    if (tempNodes.trim().localeCompare(node.trim()) === 0) {
      return true;
    }
  }

  return false;
}

const setNodeStyle = (courseName) => {
  let nodeColor = "#035afc";

  if (courseName.includes(" of")) {
    nodeColor = "#808080";
  } else if (courseName.includes("*1") || courseName.includes(" 1")) {
    nodeColor = "#ff08d6";
  } else if (courseName.includes("*2") || courseName.includes(" 2")) {
    nodeColor = "#de08ff";
  } else if (courseName.includes("*3") || courseName.includes(" 3")) {
    nodeColor = "#9808ff";
  } else if (courseName.includes("*4") || courseName.includes(" 4")) {
    nodeColor = "#5a08ff";
  } else if (courseName.includes("*5") || courseName.includes(" 5")) {
    nodeColor = "#ff1493";
  } else if (courseName.includes("*6") || courseName.includes(" 6")) {
    nodeColor = "#adff2f";
  } else if (courseName.includes("*7") || courseName.includes(" 7")) {
    nodeColor = "#f08080";
  } else if (courseName.includes("*8") || courseName.includes(" 8")) {
    nodeColor = "#ffc0cb";
  } else if (courseName.includes("*9") || courseName.includes(" 9")) {
    nodeColor = "#ffe7ba";
  } else if (courseName.includes("*0") || courseName.includes(" 0")) {
    nodeColor = "#ffd700";
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
    width: courseName.length * 21,
  };

  return style;
}

const findNode = (nodeID,nodes) => {
  let answer = null;

  nodes.forEach((node) => {
    if (node.id.localeCompare(nodeID) === 0) {
      answer = node;
    }
  });

  return answer;
};

const addGraphEdges = (source,target,edges,nodes) => {
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
    animated: false,
  };

  const targetNode = findNode(target,nodes);

  if (targetNode !== null) {
    targetNode.data.prereqs.push(source);
  }

  edges.push(edge);

  return edge;
};

const addGraphNode = (id, label, nodes) => {
  if (id === "") {
    return;
  }

  const position = { x: 0, y: 0 };
  const node = {
    id: '',
    data: { label: '', prereqs: []},
    style: {},
    originalStyle: {},
    position,
    parents: [],
  };

  node.id = id;
  node.data.label = label;
  node.style = setNodeStyle(node.data.label);
  node.originalStyle = node.style;

  nodes.push(node);

  return node;
};

/**
 *
 * @param {JSON} coursesJSON - JSON of all scraped courses
 * @param {String} prefix - "1 of", "2 of", etc
 * @param {String Array} preCourses - All the pre-requisite courses' name for one course
 * @param {String} subject - search term for the graph creation
 * @param {Integer} nameCounts - Count how many "1 of" nodes are there
 * @param {String Array} allPreCourse - only using this for makegraph-coursecode,
 * store all the pre-req courses
 * @param {String} coursecode - Current course's name
 * @param {Digraph} g - Current Working graph
 */
// eslint-disable-next-line max-len
function createNodes(coursesJSON, prefix, preCourses, subject, nameCounts, allPreCourse, coursecode, nodes, connect) {
  /* Declaring my variables*/
  let count = 0;
  let tmpNameCounts = 0;

  // This for loop will loop though the pre courses list, and check if the subject name matches
  // If it matches, then count ++
  // If there is only one course matches the subject name, then we do not need 'one of' node
  for (let i = 0; i < preCourses.length; i += 1) {
    const splitCourse = preCourses[i];

    if (checkCourseEligible(splitCourse.trim(), coursesJSON, subject)) {
      count += 1;
    }
  }

  // If count > 1, means there are more than one course
  // in the preCourses list matches the subject name
  // Then we need to add the 'One of' node
  if (count > 1) {
    let newName = prefix.toString();

    // check if '1 of' node exists, if it exists, then we need to rename it
    if (nodeExist(prefix, nodes)) {
      tmpNameCounts+= 1; // exists, add one
      // name it using prefix and the nameCounts's value, so it's unique
      newName = (prefix + (nameCounts + 1)).toString();
    }

    addGraphNode(newName,prefix,nodes);

    /* This for loop will go through all the preCourses and add node for them */
    for (let i = 0; i < preCourses.length; i += 1) {
      const splitCourse = preCourses[i];

      if (checkCourseEligible(splitCourse.trim(), coursesJSON, subject)) { // compare it first
        // push it to the array, need to use this array when recursing
        allPreCourse.push(splitCourse.trim());
        const node = splitCourse.trim();

        if (!nodeExist(node,nodes)) {
          addGraphNode(node,node,nodes);
        }
        if (!nodesConnected(node, newName, connect)) { // if no edges between them, add one
          addGraphEdges(node,newName,connect,nodes);
        }
      }
    }

    // if no edges between the prefix node and coursecode node,add one
    if (!nodesConnected(newName, coursecode, connect)) {
      addGraphEdges(newName,coursecode,connect,nodes);
    }
  } else { // if count <= 0, means do not need prefix node, just simply add the course to the graph
    for (let i = 0; i < preCourses.length; i += 1) {
      const splitCourse = preCourses[i];
      if (checkCourseEligible(splitCourse.trim(), coursesJSON, subject)) {
        allPreCourse.push(splitCourse.trim());
        const node = splitCourse.trim();

        if (!nodeExist(node,nodes)) {
          addGraphNode(node,node,nodes);
        }

        if (!nodesConnected(node, coursecode, connect)) {
          addGraphEdges(node,coursecode,connect,nodes);
        }
      }
    }
  }

  return tmpNameCounts;
}

/**
 * Split courses using includeWords as the delimiter
 * @param {*} preCourse - Prerequisite
 * @param {*} preCourses - List of Prerequisites
 * @param {*} includeWords - Delimiter to split precourses by
 */
function splitCourseProcess(preCourse, preCourses, includeWords) {
  // special case when its eg. CIS*3400 or (CIS*1200,CIS*2300)
  if (preCourse.includes(includeWords)) {
    const rgx = new RegExp(`\\b${includeWords}\\b`);
    const newSplitCourses = preCourse.split(rgx); // split the string

    removeItem(preCourses, preCourse);

    for (let i = 0; i < newSplitCourses.length; i += 1) {
      const eachCourse = newSplitCourses[i];
      preCourses.push(eachCourse);
    }
  }
}

/**
 * Split the precourses according the delimiters: ',', 'and', 'or'
 * @param {String} preCourses
 */
function findPrerequisiteSpecialCase(preCourses) {
  if (preCourses.length !== 0) {
    preCourses.forEach((preCourse) => {
      splitCourseProcess(preCourse, preCourses, ',');
      splitCourseProcess(preCourse, preCourses, 'and');
      splitCourseProcess(preCourse, preCourses, 'or');
    });
  }
}

/**
 * Add all the prerequisites above a course
 * @param {JSON} coursesJSON - JSON of all scraped courses
 * @param {Digraph} g - Current working graph
 * @param {JSON} course - JSON of the course that was searched for
 * @param {String} coursecode - Code of the course that was searched for
 * @param {String} subject - Subject that was searched for
 * @param {String} allPreCourse -
 * @param {Integer} nameCounts -
 * @returns New value for nameCounts
 */
function findPrerequisite(coursesJSON, nodes, course, coursecode, subject, allPreCourse, nameCounts,connect) {
  /* This for loop will go through every pre-requisite courses and add a node to the graph */
  for (let i = 0; i < course.CoursePrerequisite.length; i += 1) {
    const prereq = course.CoursePrerequisite[i];

    // remove square brackets first
    // loop through the string to find if more , and () found
    const removeSquareBrackets = prereq.replace(/[[\]']+/g, '');
    let preCourses = removeSquareBrackets.replace(/[()]/g, ''); // remove the () brackets

    // Four cases
    // 1. eg. CIS*1330 or CIS*1500
    // 2. eg. 1 of CIS*1300, CIS*1500
    // 3. eg. 12 credits including CIS*1300, CIS*1500
    // 4. general cases

    if (searchWord(preCourses, 'or') || searchWord(preCourses, 'and')) {
      let prefix;
      if (searchWord(preCourses, 'or')) {
        const pattern = '\\bor\\b';
        const rgx = new RegExp(pattern);
        preCourses = preCourses.split(rgx); // split the string using or
        prefix = '1 of'; // the prefix should be "1 of"
      } else if (searchWord(preCourses, 'and')) {
        const pattern = '\\band\\b';
        const rgx = new RegExp(pattern);
        preCourses = preCourses.split(rgx); // split the string using or
        prefix = 'all'; // the prefix should be "1 of"
      }

      findPrerequisiteSpecialCase(preCourses);

      nameCounts += createNodes(
        coursesJSON,
        prefix,
        preCourses,
        subject,
        nameCounts,
        allPreCourse,
        coursecode,
        nodes,
        connect
      );
    } else if (searchWord(preCourses, 'of') || searchWord(preCourses, 'including')) {
      let found = 1;
      const indexOfComma = preCourses.indexOf(',');
      let index;

      if (preCourses.includes('of')) {
        index = preCourses.indexOf('of') + 2; // find the index of 'of', add 2 to find the end index of it
      } else if (searchWord(preCourses, 'including')) {
        // find the index of 'including', add 9 to find the end index of it
        index = preCourses.indexOf('including') + 9;
      }

      let prefix;

      if (indexOfComma < (index - 2)) {
        let firstCourse = preCourses.substring(0, indexOfComma).trim();

        if (firstCourse === "") {
          prefix = preCourses.substring(0, index).trim();
          firstCourse = preCourses.substring(index, preCourses.length).trim();
          found = 0;

          if (checkCourseEligible(firstCourse, coursesJSON, subject)) { // exact match
            allPreCourse.push(firstCourse);
            addGraphNode(firstCourse,firstCourse,nodes);

            if (!nodesConnected(firstCourse, coursecode, connect)) {
              addGraphEdges(firstCourse,coursecode,connect,nodes);
            }
          }
        } else {
          prefix = preCourses.substring(indexOfComma + 1, index).trim();
          preCourses = preCourses.substring(indexOfComma + 1, preCourses.length).split(',');

          if (checkCourseEligible(firstCourse, coursesJSON, subject)) { // exact match
            allPreCourse.push(firstCourse);
            addGraphNode(firstCourse,firstCourse,nodes);

            if (!nodesConnected(firstCourse, coursecode, connect)) {
              addGraphEdges(firstCourse,coursecode,connect,nodes);
            }
          }
        }
      } else {
        // split the string
        prefix = preCourses.substring(0, index).trim();
        preCourses = preCourses.substring(index, preCourses.length).split(',');
      }

      if (found) {
        findPrerequisiteSpecialCase(preCourses);
      }

      nameCounts += createNodes(
        coursesJSON,
        prefix,
        preCourses,
        subject,
        nameCounts,
        allPreCourse,
        coursecode,
        nodes,
        connect
      );
    } else {
      // if general cases
      const prepNode = prereq.trim();

      if (checkCourseEligible(prepNode, coursesJSON, subject)) { // exact match
        allPreCourse.push(prepNode);
        addGraphNode(prepNode,prepNode,nodes);

        if (!nodesConnected(prepNode, coursecode, connect)) {
          addGraphEdges(prepNode,coursecode,connect,nodes);
        }
      }
    }
  }

  return nameCounts;
}

/**
 * Makes a graph of a subject using courses
 * @param {JSON} coursesJSON - JSON of scraped courses
 * @param {Array} courses - Array of course JSONs
 * @param {String} subject - Search term the user entered
 * @param {Digraph} g - Current working graph
 */
export function makegraphSubject(coursesJSON, courses, subject,result) {
  let countDouble = 0;
  let nodes = [];
  let connect = [];

  // go through each course
  if (courses.length === 0) {
    return;
  }

  courses.forEach((course) => {
    let coursecode = course.CourseCode;
    addGraphNode(coursecode,coursecode,nodes);
    const allPreCourse = [];

    if (course.CoursePrerequisite.length !== 0) {
      countDouble = findPrerequisite(
        coursesJSON,
        nodes,
        course,
        coursecode,
        subject,
        allPreCourse,
        countDouble,
        connect
      );
    }
  });

  /* Assign node array and edge array to the result*/
  result.narr = nodes;
  result.earr = connect;
  result["degreeName"] = courses[0].CourseDepartment;
}

/**
 * Link prerequisites courses together
 * @param {Object} g - graph
 * @param {Array} courses - all the courses for one subject/major
 */
function processLink(connect,courses,nodes) {
  // For one course's pre-requisites, it may contain many of them
  // e.g: All of ECON 101, ECON 102
  // There for, we need a double for loop to go through each course in the array, and if
  // it is the pre-requisites course, add an edge to it.
  courses.forEach((course) => { // first loop, loop through each course and find it's pre-requisites
    courses.forEach((course2) => {
      if (course.CoursePrerequisite.length !== 0) { // make sure it has a pre-requisites
        let tempCode = course2.CourseCode.replace('*',' ');

        if (course.CoursePrerequisite.includes(tempCode)) {
          if (!nodesConnected(course.CourseCode,course2.CourseCode,connect)) {
            addGraphEdges(course2.CourseCode,course.CourseCode,connect,nodes);
          }
        }
      }
    });
  });
}

/**
 * This function will create graphs for all the subjects in UBC
 * @param {JSON} courses - the JSON object that contains all the UBC courses' info
 */
export function makegraphUBCSubjects(courses, term, result) {
  let nodes = [];
  let connect = [];

  /* Loop through each course and add an * to them */
  courses.forEach((course) => {
    course.CourseCode = course.CourseCode.replace(' ','*');
  });

  const filterObj = {
    CourseCode:term
  }

  let ubcCourses = searchCourseMultiValue(courses, filterObj);

  if (ubcCourses.length === 0) {
    return;
  }

  ubcCourses.forEach((course) => {
    let coursecode = course.CourseCode;
    // For some course code, it contains the course name as well
    // e.g: PHYS 106(3) Enriched Physics
    if (coursecode.includes('(')) {
      coursecode = coursecode.split('(')[0].trim();
    }

    addGraphNode(coursecode, coursecode, nodes);
  });

  ubcCourses.forEach(() => {
    processLink(connect, ubcCourses, nodes);
  });

  /* Assign node array and edge array to the result*/
  result.narr = nodes;
  result.earr = connect;
}

/**
 * Makes a graph of a course and all its prerequisites recursively
 * @param {JSON} coursesJSON - JSON of all scraped courses
 * @param {Array} courses - Array of course JSONs
 * @param {Digraph} g - Current working graph
 * @param {JSON} filterObj - Filter to use when searching for courses
 * @param {Integer} countDouble - Counter for how many duplicates there are of a node
 */
export function makegraphCoursecode(coursesJSON, courses, filterObj, countDouble,nodes,connect) {
  for (let i = 0; i < courses.length; i += 1) {
    const course = courses[i];

    addGraphNode(course.CourseCode, course.CourseCode, nodes);

    const coursecode = course.CourseCode;
    const subject = getSubject(course.CourseCode);
    const allPreCourse = [];

    if (course.CoursePrerequisite.length !== 0) {
      findPrerequisite(
        coursesJSON,
        nodes,
        course,
        coursecode,
        subject,
        allPreCourse,
        countDouble,
        connect
      );

      /* recurively find prereq courses for this course */
      for (let j = 0; j < allPreCourse.length; j += 1) {
        const prereq = allPreCourse[j];

        const newFilter = filterObj;
        newFilter.CourseCode = prereq.trim(); // set the coursecode to new one
        makegraphCoursecode(
          coursesJSON,
          searchCourseMultiValue(coursesJSON, newFilter),
          newFilter,
          countDouble,
          nodes,
          connect
        );
      }
    } else { // if the length is 0, means no prereq course, then go back
      return;
    }
  }
}

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
    earr: [],
  };

  const params = qs.parse(req.query);
  let term = params.term.toUpperCase();
  let school = params.school;
  let courseFile;

  if (school === "University of Guelph") {
    courseFile = './data/ScrapedGuelphCourses.json';
  } else if (school === "University of British Columbia") {
    courseFile = './data/ScrapedUBCCourses.json';
  }

  let coursesJSON = await load(courseFile);

  if (school === "University of Guelph") {
    const filterObj = {
      CourseCode:term
    }

    if (!term.includes('*')) {
      let courses = searchCourseMultiValue(coursesJSON, filterObj);

      makegraphSubject(coursesJSON,courses,term,result);

      if (result.narr.length === 0) {
        result["degreeName"] = "No Results found. Check your spelling and try again.";
      } else {
        setParentNodes(result.narr);
      }
    } else {
      let nodes = [];
      let connect = [];
      let courses = searchCourseMultiValue(coursesJSON, filterObj);

      makegraphCoursecode(coursesJSON, courses, filterObj, 0, nodes,connect);

      if (nodes.length === 0) {
        result["degreeName"] = "No Results found. Check your spelling and try again.";
      } else {
        result.narr = nodes;
        setParentNodes(result.narr);
        result.earr = connect;
      }
    }
  } else if (school === "University of British Columbia") {
    makegraphUBCSubjects(coursesJSON,term,result);

    if (result.narr.length === 0) {
      result["degreeName"] = "No Results found. Check your spelling and try again.";
    } else {
      setParentNodes(result.narr);
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
