/**
 * sort the course alphabetically
 *
 * @param {*} course the unsorted array
 * @param {*} key could be a string or array, default value is CourseCode
 * @returns sorted array
 */
function sort(course = [], key = 'CourseCode') {
  // the the key is array
  if (Array.isArray(key)) {
    course.sort((a, b) => {
      // keep looping the key array and compare each course until
      // find a[key[i]] not equal to b[key[i]]
      // return 1 if a[key[i]] is greater otherwise return -1
      for (let i = 0; i < key.length; i += 1) {
        if (a[key[i]] > b[key[i]]) {
          return 1;
        }

        if (a[key[i]] < b[key[i]]) {
          return -1;
        }
      }
      // all value for keys in a and b are equal then return 0
      return 0;
    });
  } else if (typeof key === 'string') {
    // if key is just a string
    course.sort((a, b) => {
      if (a[key] > b[key]) {
        return 1;
      }

      if (a[key] < b[key]) {
        return -1;
      }

      return 0;
    });
  }

  return course;
}

export default sort;
