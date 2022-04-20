import graphviz from 'graphviz';
import searchCourseMultiValue from './coursesearch.js';

/**
 * Removes an item from an array.
 *
 * @param {Array} array - The array to remove the item from
 * @param {String} value - The value to remove from the array
 */
export function removeItem(array, value) {
  const index = array.indexOf(value);

  if (index > -1) {
    array.splice(index, 1);
  }
}

/**
 * Get the subject from a course code. (ex. CIS*1300 has the subject CIS)
 *
 * @param {String} coursecode - The course code to get the subject from
 *
 * @returns {String} - The subject
 */
export function getSubject(coursecode) {
  return coursecode.split('*')[0]; // split the string by *
}

/**
 * This function will tell you whether the value is in the string.
 *
 * @param {String} stringToSearch - The string to search in
 * @param {String} value - The value to search for
 *
 * @returns {Boolean} True if value is in the string, false if not
 */
export function searchWord(stringToSearch, value) {
  return new RegExp(`\\b${value}\\b`).test(stringToSearch);
}

/**
 * Checks for the existence of a course in coursesJSON
 *
 * @param {JSON} coursesJSON - JSON array filled with all the courses
 * @param {String} courseCode - The course code to search for
 *
 * @returns {Boolean} - True if found, false if not found
 */
export function courseExist(coursesJSON, courseCode) {
  const filterObj = {
    CourseCode: courseCode.toUpperCase(),
  };

  return (searchCourseMultiValue(coursesJSON, filterObj).length > 0);
}

/**
 * Checks if the course exists and if this course's subject is relevant to the
 * user choice (STAT*2040 is not part of CIS courses, return false)
 * @param {String} courseName - Course name
 * @param {*} coursesJSON - course Json object
 * @param {String} subject - the subject name
 * @returns {Boolean} - True if the course should be add to the graph, false if not
 */
export function checkCourseEligible(courseName, coursesJSON, subject) {
  return ((getSubject(courseName).localeCompare(subject) === 0
    && courseExist(coursesJSON, courseName)));
}

/**
 * colourPicker
 * @param {String} name - the node text you would like to pick the colour for.
 * @returns - colour depending on which year the course should be taken.
 * gray if none were applicable
 */
export function colourPicker(name) {
  let colour = 'lightgray'; // Default

  if (name.includes('*1')) {
    colour = 'lightgoldenrod1'; // First Year
  }

  if (name.includes('*2')) {
    colour = 'seagreen1'; // Second Year
  }

  if (name.includes('*3')) {
    colour = 'salmon1'; // Third Year
  }

  if (name.includes('*4')) {
    colour = 'lightblue1'; // Fourth Year
  }

  return colour;
}

/**
 * Determines if there is an edge between two nodes
 * @param {Node} node1
 * @param {Node} node2
 * @param {Digraph} g
 * @returns True if there is an edge between node1 and node2
 */
export function nodesConnected(node1, node2, g) {
  for (let i = 0; i < g.edges.length; i += 1) {
    const nodeOne = g.edges[i].nodeOne.id;
    const nodeTwo = g.edges[i].nodeTwo.id;

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
function nodeExist(node, g) {
  return (g.nodes.items[node] !== undefined); // return true if exists
}

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
function createNodes(coursesJSON, prefix, preCourses, subject, nameCounts, allPreCourse, coursecode, g) {
  let count = 0;
  let tmpNameCounts = nameCounts;
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
    let prefixNode;

    // check if '1 of' node exists, if it exists, then we need to rename it
    if (nodeExist(prefix, g)) {
      tmpNameCounts += 1; // exists, add one
      // name it using prefix and the nameCounts's value, so it's unique
      const newName = prefix + tmpNameCounts.toString();
      // prefix will be 'One of', but the id will be different
      prefixNode = g.addNode(newName, { label: prefix, style: 'filled', color: 'gray' });
    } else {
      prefixNode = g.addNode(prefix, { label: prefix, style: 'filled', color: 'gray' }); // if doesn't exist, create one
    }

    /* This for loop will go through all the preCourses and add node for them */
    for (let i = 0; i < preCourses.length; i += 1) {
      const splitCourse = preCourses[i];

      if (checkCourseEligible(splitCourse.trim(), coursesJSON, subject)) { // compare it first
        // push it to the array, need to use this array when recursing
        allPreCourse.push(splitCourse.trim());
        const node = splitCourse.trim();
        if (!nodesConnected(node, prefixNode.id, g)) { // if no edges between them, add one
          g.addEdge(node, prefixNode);
        }
      }
    }

    // if no edges between the prefix node and coursecode node,add one
    if (!nodesConnected(prefixNode.id, coursecode.id, g)) {
      g.addEdge(prefixNode, coursecode);
    }
  } else { // if count <= 0, means do not need prefix node, just simply add the course to the graph
    for (let i = 0; i < preCourses.length; i += 1) {
      const splitCourse = preCourses[i];

      if (checkCourseEligible(splitCourse.trim(), coursesJSON, subject)) {
        allPreCourse.push(splitCourse.trim());
        const node = splitCourse.trim();
        if (!nodesConnected(node, coursecode.id, g)) {
          g.addEdge(node, coursecode);
        }
      }
    }
  }
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
  preCourses.forEach((preCourse) => {
    splitCourseProcess(preCourse, preCourses, ',');
    splitCourseProcess(preCourse, preCourses, 'and');
    splitCourseProcess(preCourse, preCourses, 'or');
  });
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
function findPrerequisite(coursesJSON, g, course, coursecode, subject, allPreCourse, nameCounts) {
  /* This for loop will go through every pre-requisite courses and add a node to the graph */
  for (let i = 0; i < course.CoursePrerequisite.length; i += 1) {
    const prereq = course.CoursePrerequisite[i];

    // remove square brackets first
    // loop through the string to find if more , and () found
    const removeSquareBrackets = prereq.replace(/[[\]']+/g, '');
    let preCourses = removeSquareBrackets.replace(/[()]/g, ''); // remove the () brackets

    // console.log(preCourses);

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
      createNodes(
        coursesJSON,
        prefix,
        preCourses,
        subject,
        nameCounts,
        allPreCourse,
        coursecode,
        g,
      );
    } else if (searchWord(preCourses, 'of') || searchWord(preCourses, 'including')) {
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
        const firstCourse = preCourses.substring(0, indexOfComma).trim();
        prefix = preCourses.substring(indexOfComma + 1, index).trim();
        preCourses = preCourses.substring(indexOfComma + 1, preCourses.length).split(',');
        if (checkCourseEligible(firstCourse, coursesJSON, subject)) { // exact match
          allPreCourse.push(firstCourse);
          if (!nodesConnected(firstCourse, coursecode.id, g)) {
            g.addEdge(firstCourse, coursecode);
          }
        }
      } else {
        // split the string
        prefix = preCourses.substring(0, index).trim();
        preCourses = preCourses.substring(index, preCourses.length).split(',');
      }

      findPrerequisiteSpecialCase(preCourses);
      createNodes(
        coursesJSON,
        prefix,
        preCourses,
        subject,
        nameCounts,
        allPreCourse,
        coursecode,
        g,
      );
    } else {
      // if general cases
      const prepNode = prereq.trim();
      if (checkCourseEligible(prepNode, coursesJSON, subject)) { // exact match
        allPreCourse.push(prepNode);
        if (!nodesConnected(prepNode, coursecode.id, g)) {
          g.addEdge(prepNode, coursecode);
        }
      }
    }
  }
  return nameCounts;
}

/**
 * Makes a graph of a course and all its prerequisites recursively
 * @param {JSON} coursesJSON - JSON of all scraped courses
 * @param {Array} courses - Array of course JSONs
 * @param {Digraph} g - Current working graph
 * @param {JSON} filterObj - Filter to use when searching for courses
 * @param {Integer} countDouble - Counter for how many duplicates there are of a node
 */
export function makegraphCoursecode(coursesJSON, courses, g, filterObj, countDouble) {
  for (let i = 0; i < courses.length; i += 1) {
    const course = courses[i];

    const nodeColour = colourPicker(course.CourseCode);
    const coursecode = g.addNode(course.CourseCode, { shape: 'box', style: 'filled', color: nodeColour });
    const subject = getSubject(course.CourseCode);
    const allPreCourse = [];
    if (course.CoursePrerequisite.length !== 0) {
      findPrerequisite(
        coursesJSON,
        g,
        course,
        coursecode,
        subject,
        allPreCourse,
        countDouble,
      ); // find all the pre courses

      /* recurively find prereq courses for this course */
      for (let j = 0; j < allPreCourse.length; j += 1) {
        const prereq = allPreCourse[j];

        const newFilter = filterObj;
        newFilter.CourseCode = prereq.trim(); // set the coursecode to new one
        makegraphCoursecode(
          coursesJSON,
          searchCourseMultiValue(coursesJSON, newFilter),
          g,
          newFilter,
          countDouble,
        );
      }
    } else { // if the length is 0, means no prereq course, then go back
      return;
    }
  }
}

/**
 * Makes a graph of a subject using courses
 * @param {JSON} coursesJSON - JSON of scraped courses
 * @param {Array} courses - Array of course JSONs
 * @param {String} subject - Search term the user entered
 * @param {Digraph} g - Current working graph
 */
export function makegraphSubject(coursesJSON, courses, subject, g) {
  let countDouble = 0;
  // go through each course
  courses.forEach((course) => {
    const nodeColour = colourPicker(course.CourseCode);
    const coursecode = g.addNode(course.CourseCode, { shape: 'box', style: 'filled', color: nodeColour });
    const allPreCourse = [];
    if (course.CoursePrerequisite.length !== 0) {
      countDouble = findPrerequisite(
        coursesJSON,
        g,
        course,
        coursecode,
        subject,
        allPreCourse,
        countDouble,
      );
    }
  });
}

/**
 * Searches for a major within the JSON of scraped programs.
 * @param {JSON} programsJSON - JSON object filled with the majors and minors of all degrees
 * @param {String} searchTerm - The major to find in the JSON of majors
 * @returns - Major if found, empty JSON if not
 */
function searchMajor(programsJSON, searchTerm) {
  let major = {};

  programsJSON.forEach((JSON) => {
    if (JSON.programCode.toLowerCase() === searchTerm.toLowerCase()
      && JSON.majorInformation.major === true) {
      major = JSON;
    }
  });

  return major;
}

/**
 * Searches for a major by name within the JSON of scraped programs.
 * @param {JSON} programsJSON - JSON object filled with the majors and minors of all degrees
 * @param {String} searchName - The major name to find in the JSON of majors
 * @returns - Major if found, empty JSON if not
 */
function searchMajorName(programsJSON, searchName) {
  let majorName = {};

  programsJSON.forEach((JSON) => {
    if (JSON.programName
      && JSON.programName.toLowerCase().trim() === searchName.toLowerCase().trim()
      && JSON.majorInformation.major === true) {
      majorName = JSON;
    }
  });

  return majorName;
}

/**
 * Searches for a minor within the JSON of scraped programs.
 * @param {JSON} programsJSON - JSON object filled with the majors and minors of all degrees
 * @param {String} searchTerm - The major to find in the JSON of majors
 * @returns - Major if found, empty JSON if not
 */
function searchMinor(programsJSON, subject) {
  let minor = {};

  programsJSON.forEach((JSON) => {
    if (JSON.programCode.toLowerCase() === subject.toLowerCase()
      && JSON.minorInformation.minor === true) {
      minor = JSON;
    }
  });

  return minor;
}

/**
 * Searches for a minor by name within the JSON of scraped programs.
 * @param {JSON} programsJSON - JSON object filled with the majors and minors of all degrees
 * @param {String} searchName - The minorName to find in the JSON of minors
 * @returns - Major if found, empty JSON if not
 */
function searchMinorName(programsJSON, searchName) {
  let minorName = {};

  programsJSON.forEach((JSON) => {
    if (JSON.programName
      && JSON.programName.toLowerCase().trim() === searchName.toLowerCase().trim()
      && JSON.minorInformation.minor === true) {
      minorName = JSON;
    }
  });

  return minorName;
}

/**
 * Goes through all the courses within a program and creates an edge between nodes
 * that have prerequisites.
 * @param {JSON} coursesJSON - JSON of all scraped courses
 * @param {JSON} filterObj - Filter Object to find courses
 * @param {JSON} major - JSON of the search term
 * @param {Digraph} g - Digraph that is being built
 * @param {String} level - String indicating whether it is a major or a minor
 */
function makegraphProgram(coursesJSON, filterObj, major, g, level) {
  // Title to append to the top of the graph in the format:
  // [Program Name] [Major / Minor]
  const graphTitle = `${major.programName} ${level}`;

  let courses;
  if (level === 'Major') { courses = major.majorInformation.courses; }
  if (level === 'Minor') { courses = major.minorInformation.courses; }

  const newFilter = filterObj;

  courses.forEach((course) => {
    // Add the course as a node
    const nodeColour = colourPicker(course);
    g.addNode(course, { shape: 'box', style: 'filled', color: nodeColour });

    // get the list of prerequisites
    newFilter.CourseCode = course;
    const result = searchCourseMultiValue(coursesJSON, filterObj);

    // loop through the prerequisites and if it exists in the program add an edge
    result[0].CoursePrerequisite.forEach((prereq) => {
      courses.forEach((course2) => {
        if (prereq.includes(course2)) {
          g.addEdge(course2, course);
        }
      });
    });
  });

  // Add a title to the top of the graph
  g.set('label', `${graphTitle}\n\n`);
  g.set('labelloc', 't');
  g.set('fontsize', '28');
  g.set('fontname', 'Times-Roman bold');
}

/**
 * Creates a digraph and branches into subfunctions depending on the value of flag
 * @param {JSON} coursesJSON - JSON of all scraped courses
 * @param {JSON} majorsJSON - JSON of all scraped programs
 * @param {char} flag - "None": Courses / Subjects, "M": Majors, "m": Minors
 * @param {String} searchTerm - Search term entered by the user
 * @param {JSON} filterObj - Filter to use when searching through a JSON
 * @param {String} filename - User entered filename to name the output graph
 * @returns 0 on success, -1 on error
 */
export function makegraph(coursesJSON, majorsJSON, flag, searchTerm, filterObj, filename) {
  // Create digraph G
  const g = graphviz.digraph('G');

  // Flag for Subject or Course Graph
  if (flag === 'None') {
    const courses = searchCourseMultiValue(coursesJSON, filterObj);
    if (courses.length === 0) {
      console.log('No courses found to make a graph with. Aborting...');
      return -1;
    }
    if (courses.length === 1) {
      makegraphCoursecode(coursesJSON, courses, g, filterObj, 0);
    } else {
      makegraphSubject(coursesJSON, courses, searchTerm, g);
    }
  } else if (flag === 'M') {
    // Flag for Major Graph
    const major = searchMajor(majorsJSON, searchTerm);

    if (Object.keys(major).length === 0) {
      console.log(`Unable to find ${searchTerm} in the list of majors. Perhaps it was mispelled?`);
      return -1;
    }
    makegraphProgram(coursesJSON, filterObj, major, g, 'Major');
  } else if (flag === 'm') {
    // Flag for Minor Graph
    const minor = searchMinor(majorsJSON, searchTerm);

    if (Object.keys(minor).length === 0) {
      console.log(`Unable to find ${searchTerm} in the list of minors. Perhaps it was mispelled?`);
      return -1;
    }
    makegraphProgram(coursesJSON, filterObj, minor, g, 'Minor');
  } else if (flag === 'N') {
    // Flag for MajorName Graph
    const majorName = searchMajorName(majorsJSON, searchTerm);

    if (Object.keys(majorName).length === 0) {
      console.log(`Unable to find ${searchTerm} in the list of majors. Perhaps it was mispelled?`);
      return -1;
    }
    makegraphProgram(coursesJSON, filterObj, majorName, g, 'Major');
  } else if (flag === 'n') {
    // Flag for MinorName Graph
    const minorName = searchMinorName(majorsJSON, searchTerm);

    if (Object.keys(minorName).length === 0) {
      console.log(`Unable to find ${searchTerm} in the list of majors. Perhaps it was mispelled?`);
      return -1;
    }
    makegraphProgram(coursesJSON, filterObj, minorName, g, 'Minor');
  } else {
    // A flag was present but is not usable
    console.log(`Unrecognized flag: '${flag}', used. Try npm start help to see details on how to use this program. Aborting...`);
    return -1;
  }

  g.setGraphVizPath('./');
  g.output('pdf', `./graphs/${filename.replace('*', '')}.pdf`);

  return 0;
}
