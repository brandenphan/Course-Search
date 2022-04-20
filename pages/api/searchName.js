import { load } from '../../src/util.js';
import _ from "lodash";
import { searchMajor, searchMajorName, searchMinor, searchMinorName, searchCourseMultiValue } from "../../src/coursesearch";
import qs from "qs";

/**
 * Gets the full name of a degree program
 *
 * @param {String} programCode - The code of the program
 * @param {Array} courses - Array of course data for the major or minor
 * @param {String} graphType - Whether the graph is of a major or minor
 *
 * @returns {String} The full name of the program
 */
const getFullName = (programCode, courses, graphType) => {
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

  if (Object.keys(result).length !== 0) {
    result = result.degreeName;
  } else {
    result = "NOT FOUND";
  }

  return result;
}

/**
 * Gets the full name of a course department
 *
 * @param {String} programCode - The code of the program
 * @param {Array} courses - Array of course data for the major or minor
 *
 * @returns {String} The full name of the course department
 */
const getFullNameForCourse = (programCode, courses) => {
  let result;

  const filterObj = {
    CourseCode : programCode.toUpperCase()
  }

  let courseList = searchCourseMultiValue(courses, filterObj);

  if (courseList.length !== 0) {
    result = courseList[0].CourseDepartment;
  } else {
    result = "NOT FOUND";
  }

  return result;
}

/**
 * Handles the searchName API call
 *
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 *
 * @returns {Object} The JSON response
 */
const handler = async (req, res) => {
  const { method } = req;

  const params = qs.parse(req.query);

  let term = params.term;
  let graphType = params.graphType;
  let courses;
  let result = "NOT FOUND";

  if (graphType.localeCompare("Major") === 0 || graphType.localeCompare("Minor") === 0 ) {
    courses = await load('./data/GuelphMajorCourses.json');
    result = getFullName(term,courses,graphType);
  } else {
    courses = await load('./data/ScrapedGuelphCourses.json');
    result = getFullNameForCourse(term,courses,graphType);
  }

  try {
    if (method === "GET") {
      return res.status(200).json(result);
    } else if (method === "POST") {
      return res.status(201).json(result);
    } else {
      return res.status(404).json("Method unsupported");
    }
  } catch (error) {
    return res.status(400).json(error);
  }
};

export default handler;
