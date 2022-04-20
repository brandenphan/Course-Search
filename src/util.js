import { promises as fs } from 'fs';

/**
 * load courses data from file
 *
 * @param filename the name of file
 *
 * @returns a array of courses
 */
export async function load(filename) {
  // read string from file
  const data = await fs.readFile(filename, 'utf8');
  // parse the string to js object
  const courses = JSON.parse(data);

  return courses;
}

/**
 * Performs a binary search on a list of courses
 * to find the course with a given course code.
 *
 * @param data an array of objects containing course information
 * @param target the course code to search for
 *
 * @returns the index of the course if found, -1 otherwise
 */
export function courseCodeBinSearch(data, target) {
  let left = 0;
  let right = data.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + (right - left) / 2));

    if (data[mid].CourseCode.toLowerCase() === target.toLowerCase()) {
      return mid;
    }

    if (data[mid].CourseCode.toLowerCase() < target.toLowerCase()) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}

export function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
