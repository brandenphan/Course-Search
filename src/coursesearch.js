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
  let colour = '#D3D3D3'; // Default

  if (name.includes('*1')) {
    colour = '#fab9e2'; // First Year
  }

  if (name.includes('*2')) {
    colour = '#bbb2ed'; // Second Year
  }

  if (name.includes('*3')) {
    colour = '#f7f0ab'; // Third Year
  }

  if (name.includes('*4')) {
    colour = '#f7c8ab'; // Fourth Year
  }

  return colour;
}

/**
 * Searches for a major within the JSON of scraped programs.
 * @param {JSON} programsJSON - JSON object filled with the majors and minors of all degrees
 * @param {String} searchTerm - The major to find in the JSON of majors
 * @returns - Major if found, empty JSON if not
 */
export function searchMajor(programsJSON, searchTerm) {
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
export function searchMajorName(programsJSON, searchName) {
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
export function searchMinor(programsJSON, subject) {
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
export function searchMinorName(programsJSON, searchName) {
  let minorName = {};

  programsJSON.forEach((JSON) => {
    if (JSON.programName
      && JSON.programName.toLowerCase().trim()=== searchName.toLowerCase().trim()
      && JSON.minorInformation.minor === true) {
      minorName = JSON;
    }
  });

  return minorName;
}

/* Search course by one field*/
export const searchCourseByName = (courses,coursename) => {

  /* Do a linear search*/
  /* Push the results to the array*/
  for (var i = 0 ; i < courses.length ; i++)  {
    if (courses[i].CourseCode.includes(coursename)) {
      return courses[i];
    }
  }

  return null;
}

/* Search course using filter */
/* Can have multiple values */
export const searchCourseMultiValue = (courses, filter) => {
  // brute force
  // go through each key and find result and store them into an array
  const course = courses.filter((item) => {
    const keys = Object.keys(filter);

    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];

      if (filter[key] !== '---' && key !== 'OtherTerms' && key !== 'CoursePrerequisite') {
        if (key === 'CourseCode') {
          if (!filter[key].includes('*')) {
            if (getSubject(item[key]).localeCompare(filter[key]) !== 0) {
              return false;
            }
          }
        }

        if (!item[key] || !item[key].toUpperCase().includes(filter[key].toUpperCase())) {
          return false;
        }
      } else if (key === 'CoursePrerequisite' && filter[key] !== '---') {
        let flag = 0;

        for (let j = 0; j < item[key].length; j += 1) {
          if (item[key][j].toUpperCase().includes(filter[key].toUpperCase())) {
            flag += 1;
          }
        }

        if (flag === 0) {
          return false;
        }
      }
    }
    return true;
  });

  return course;
};
