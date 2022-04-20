import playwright from 'playwright';
import * as fs from 'fs';

// Scrapes all degrees and its courses
const getMajorCourses = async () => {
  // Opens a browser instance and a new page
  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://you.ubc.ca/programs/#mode=by-program&viewMode=list');

  // scrapes the inline JSON data at the bottom of the page
  const degreeLinks = await page.$eval('#ubc_programs-js-extra', (headContainer) => {
    const links = [];

    // removes the variable declaration and returns the JSON
    let data = headContainer.innerHTML.split('var programs = ')[1];

    // removes the final semi-colon along with the closing bracket
    [data] = data.split('];');

    // adds the final square bracket back in
    data += ']';

    data = JSON.parse(data);

    // iterates through the JSON data and
    // appends the degree links to the links array
    for (let i = 0; i < data.length; i += 1) {
      links.push(data[i].link);
    }

    return links;
  });

  // Logs to the user that all the degree links have now been scraped
  console.log('Scraped all degree links from: https://you.ubc.ca/programs/#mode=by-program&viewMode=list\n');

  const programInformation = [];
  for (let i = 0; i < degreeLinks.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await page.goto(degreeLinks[i]);

    // eslint-disable-next-line no-await-in-loop
    const programName = await page.$eval('h1', (degreeTitle) => degreeTitle.innerHTML);

    // gets the degree name from the program page
    // eslint-disable-next-line no-await-in-loop
    const degreeName = await page.$eval('#program-vitals', (programVitals) => {
      const listItems = programVitals.getElementsByTagName('li');

      // iterates through the list items and returns
      // the degree name from the list item prefixed with 'Degree: '
      for (let j = 0; j < listItems.length; j += 1) {
        if (listItems[j].innerHTML.includes('Degree:')) {
          const name = listItems[j].innerHTML.split(':')[1].trim();

          // remove html tags and return the degree name
          return name.replace(/<(?:.|\n)*?>/gm, '');
        }
      }

      return null;
    });

    // eslint-disable-next-line no-await-in-loop
    const programCourses = await page.$$('.example-course');
    let courses = [];

    // checks if the degree has courses listed
    if (programCourses.length) {
      // eslint-disable-next-line no-await-in-loop
      courses = await page.$eval('#program-courses', (container) => {
        const majorCourses = [];

        const course = container.getElementsByClassName('example-course');

        // iterates through the degree program courses and
        // collects the course code with the course number
        for (let j = 0; j < course.length; j += 1) {
          const courseTitle = course[j].innerHTML;

          const courseCode = courseTitle.split(' ')[0];
          const courseCodeNum = courseTitle.split(' ')[1];

          majorCourses.push(`${courseCode} ${courseCodeNum}`);
        }

        return majorCourses;
      });
    }

    // Adds the various information in the program and pushes it onto the array
    const programInformationJSON = {
      degreeName,
      programName,
      majorInformation: { courses },
    };

    programInformation.push(programInformationJSON);

    console.log(`Scraped all courses for program: \x1b[93m${programName}\x1b[39m from: ${degreeLinks[i]}`);
  }

  // Writes all programs and its information to the 'UBCMajorCourses.json' file
  fs.writeFile('UBCMajorCourses.json', JSON.stringify(programInformation), (error) => {
    if (error) throw error;
  });

  // Logs that scraping all major courses is finished and closes the browser instance
  console.log('Major Course Information Gathered and Stored in UBCMajorCourses.json! Exiting...');

  await browser.close();
};

getMajorCourses();
