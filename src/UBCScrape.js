import playwright from 'playwright';
import * as fs from 'fs';

/**
 * Function to scrape the UCB website, gathering all courses offered and its information
 */
const runUBCCourseScrapper = async () => {
  // Creates a browser instance of playwright
  const browser = await playwright.chromium.launch({ headless: true });

  // Opens a new page instance of the browser and goes to the url
  const page = await browser.newPage();
  await page.goto('http://www.calendar.ubc.ca/vancouver/courses.cfm?page=name');

  // Targets the div with ID UbcMainContent on the opened page
  const subjectLinks = await page.$eval('#UbcMainContent', (mainContainer) => {
    // Scrapes all anchor tags, storing it in aElements array
    const data = [];
    const aElements = mainContainer.getElementsByTagName('a');

    // Traverses through the anchor tags array, scraping all the different subject links
    // Starts at 3 because the first 3 anchor tags aare not related to subjects
    // Increments by two as the website has the same subject link back to back
    for (let aNumber = 3; aNumber < aElements.length; aNumber += 2) {
      data.push(aElements[aNumber].href);
    }
    return data;
  });

  // Logs that all subject links have been successfully scraped
  console.log('Scraped all subject links from http://www.calendar.ubc.ca/vancouver/courses.cfm?page=name');

  // Traverses the subject links
  const courseInformation = [];
  for (let i = 0; i < subjectLinks.length; i += 1) {
    // Goes to the current subject link
    // eslint-disable-next-line no-await-in-loop
    await page.goto(subjectLinks[i]);

    // Targets the div with ID UbcMainContent
    // eslint-disable-next-line no-await-in-loop
    const scrapeSubjectCourses = await page.$eval('#UbcMainContent', (mainContainer) => {
      // Scrapes the dl tag
      const courseSection = mainContainer.getElementsByTagName('dl');

      // Scrapes all dt/dd tags associated with the dl taag
      const scrapedDtElements = courseSection[0].getElementsByTagName('dt');
      const scrapedDdElements = courseSection[0].getElementsByTagName('dd');

      // Traverses through all the courses in the current subject
      const courses = [];
      for (let j = 0; j < scrapedDtElements.length; j += 1) {
        // Scrapes the course code of the current course
        let courseCode = scrapedDtElements[j].textContent;
        courseCode = courseCode.substring(0, courseCode.lastIndexOf('(') - 1);

        // Scrapes the course name of the current course
        const courseName = scrapedDtElements[j].getElementsByTagName('b')[0].textContent;

        // Scrapes the prerequisite of the current course
        let prerequisites = '';
        // Splits the dd elements innerHTML by new line
        const scrapedPrerequisites = scrapedDdElements[j].innerHTML.split('\n');
        // Traverses through each line and looks for a prerequisite
        for (let z = 0; z < scrapedPrerequisites.length; z += 1) {
          // Removing unnecessary characters in the innerHTML
          scrapedPrerequisites[z] = scrapedPrerequisites[z].replaceAll('\t', '').replaceAll('<br>', '').replaceAll('<em>', '').replaceAll('</em>', '')
            .replaceAll('  ', ' ');

          // If a prerequisite exists, grab all the values and breaks out of the loop
          if (scrapedPrerequisites[z].includes('Prerequisite:')) {
            const prerequisiteSplit = scrapedPrerequisites[z].split(':');
            prerequisites = prerequisiteSplit[1].substring(1, prerequisiteSplit[1].length);
            break;
          }
        }

        // Fills the JSON with course information, only need CourseCode, CourseName,
        // CoursePrerequisite, included others to keep consistent with UofG scrape format
        const courseInformationJSON = {
          CourseCode: courseCode,
          CourseName: courseName,
          CourseSeasons: '',
          CourseLectures: '',
          CourseWeight: '',
          CourseDescription: '',
          CourseOffering: '',
          CoursePrerequisite: prerequisites,
          CourseEquate: '',
          CourseRestriction: '',
          CourseDepartment: '',
          CourseLocation: '',
        };

        // The current course information onto the courses array
        courses.push(courseInformationJSON);
      }
      return courses;
    });

    // Grabs all courses of the current subject and gets the subject code
    const subjectCourses = scrapeSubjectCourses;
    const subjectCode = subjectCourses[0].CourseCode.split(' ')[0];

    // Traverses through all the courses of the
    // current subject, pushing it onto the courseInformation array
    for (let j = 0; j < subjectCourses.length; j += 1) {
      courseInformation.push(subjectCourses[j]);
    }

    // Logs that all courses for the current subject have been scraped
    console.log(`Scraped all courses for subject \x1b[36m${subjectCode}\x1b[0m from: ${subjectLinks[i]}`);
  }

  // Writes all the scraped courses to ScrapedUBCCourses.json
  fs.writeFile('ScrapedUBCCourses.json', JSON.stringify(courseInformation), (error) => {
    if (error) throw error;
  });

  // Closes the browser and logs that all courses have been scraped
  await browser.close();
  console.log('\x1b[36mUniversity of British Columbia\x1b[0m Course Information Gathered! Exiting...');
};

// Logs that courses will begin to scrape from UBC and runs the UBC course scraper
console.log('Gathering all \x1b[36mUniversity of British Columbia\x1b[0m Course Information... ');
runUBCCourseScrapper();
