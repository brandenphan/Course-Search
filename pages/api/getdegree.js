import qs from "qs";
import { load } from '../../src/util.js';
import _ from "lodash";

const handler = async (req, res) => {
    const { method } = req;
    
    const params = qs.parse(req.query);
    let school = params.school;
    let type = params.type;
    let degreeFile;
    let result = [];
    let programs = [];

    if (school === "University of Guelph") {
        degreeFile = './data/GuelphMajorCourses.json';
        programs = await load(degreeFile);
    }
    else if (school === "University of British Columbia") {
        degreeFile = './data/UBCMajorCourses.json';
        programs = await load(degreeFile);
    }

    let exist = false;
    if (programs.length > 0) {
        programs.forEach((program) => {
            if ((type === "Major" && program.majorInformation.major === true && program.majorInformation.courses.length > 0) ||
            (school === "University of Guelph" && type === "Minor" && program.minorInformation.minor === true) ||
            (school === "University of British Columbia" && type === "Major")) {
                result.forEach((p) => {
                    if (!exist){
                        if (p === program.programName){
                            exist = true;
                        }
                    }
                });

                if (!exist) {
                    let programName = program.programName;

                    if (programName) {
                        programName = programName.replace('&amp;', '&');

                        result.push(programName);
                    }
                }
            }

            exist = false;
        });
    }

    result.sort();

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
