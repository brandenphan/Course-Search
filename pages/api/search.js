import { load } from '../../src/util.js';
import _ from "lodash";
import qs from "qs";

// Function that takes in filters and data, and returns all the data that matches the filters
const getFilteredCourses = (obj, data) => {
    // Filters through the data based on the filters stored in obj, returning the array of filtered data in results and returning
    const results = data.filter((course) => {
        // The Different filter, each must match 
        return Object.entries(obj).every(([key, value]) => course[key]
            && value.some((e) => course[key].toLowerCase()?.includes(e.toLowerCase())))
    });

    return results;
}

// Handles the API response upon making a call to /api/search
const handler = async (req, res) => {
    // Gets the type of request that is being made to this API
    const { method } = req;

    // Loads the scraped University of Guelph course data
    let courses = await load('./data/ScrapedGuelphCourses.json');

    // Parses the stringified query sent
    const params = qs.parse(req.query);

    // Stores the an array of JSON's consisting of the filter type and filter input. Ex: [{ CourseCode: "CIS" }] since the array of filters in the queries
    // have extra unneeded information
    const input = params.filters.map((filter) => {
        const j = { [filter.filter]:filter.input };
        return j;
    });
    
    // Parses through the array of filters and stores it inside filters array
    const filters = {};
    input.forEach(e=>{
        Object.entries(e).map(([key,val])=>key in filters ? filters[key].push(val) : filters[key]=[val])
    });

    // Calls getFilteredCourses which will return an array of courses that has been filtered using the filters in the queries
    const results = getFilteredCourses(filters, courses);

    // Depending on the type of request, returns the data processesed above
    try {
        if (method === "GET") {
            return res.status(200).json(results);
        } else if (method === "POST") {
            return res.status(201).json(results);
        } else {
            return res.status(404).json("Method unsupported");
        }
    } catch (error) {
        return res.status(400).json(error);
    }
};

export default handler;
