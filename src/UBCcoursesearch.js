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
