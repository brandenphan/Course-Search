import qs from "qs";
import { load } from '../../src/util.js';
import _ from "lodash";

const handler = async (req, res) => {
    const { method } = req;

    const params = qs.parse(req.query);
    let school = params.school;
    let coursesJSON;
    let result = [];
    let courses = [];
    let tempSchool = 0;

    if (school === "University of Guelph") {
        coursesJSON = './data/ScrapedGuelphCourses.json';
        courses = await load(coursesJSON);
    }
    else if (school === "University of British Columbia") {
        coursesJSON = './data/ScrapedUBCCourses.json';
        courses = await load(coursesJSON);
        tempSchool = 1;
    }

    // check course array length
    if (courses.length > 0) {
        let subject;
        // Find the subject code for the  first course
        if (tempSchool === 0) { // UOG
            subject = courses[0].CourseCode.split('*')[0];//find the subject code for the first course
        } else { // UBC
            subject = courses[0].CourseCode.split(' ')[0];//find the subject code for the first course
        }

        result.push(subject);//push the first course into the list
        courses.forEach((course) => {//loop through the array
          let tempSub;

          if (tempSchool === 0) { // uog
              tempSub = course.CourseCode.split('*')[0];//find the subject code for the first course
          } else { // ubc
              tempSub = course.CourseCode.split(' ')[0];//find the subject code for the first course
          }

          /* Compare the tempSub name with the subject name, if it's different, then it means we have a new subject*/
          if (tempSub.localeCompare(subject) !== 0) {
            subject = tempSub;
            result.push(tempSub); // find a new subject code, push it into the list
          }
        });
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
