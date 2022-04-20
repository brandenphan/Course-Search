import playwright from 'playwright';
import * as fs from 'fs';

/*
 * Function to scrape the University of Guelph calendar website gathering
 * all courses offered and storing it inside ScrapedCourses.json
 */
async function runGuelphCourseScraper() {
  // Creates a chromium instance with headless so the browser UI doesn't open
  const browser = await playwright.chromium.launch({
    headless: true,
  });

  // Creates a new page of the browser instance
  // and goes to the University of Guelph calendar website
  const page = await browser.newPage();
  await page.goto('https://calendar.uoguelph.ca/undergraduate-calendar/course-descriptions/');

  // Grabs the div element with class name ".az_sitemap"
  // as that container has all the links to the different course types
  const courseTypeLink = await page.$eval('.az_sitemap', (headContainer) => {
    // Grabs all the anchor elements within the ".az_sitemap" container
    const data = [];
    const aElements = headContainer.getElementsByTagName('a');

    // Traverses through all the anchor elements(course type links), starting at 21
    // because all anchors before do not relate to the course type links and
    // pushes them onto the data array
    for (let aNumber = 21; aNumber < aElements.length; aNumber += 1) {
      data.push(aElements[aNumber].href);
    }
    return data;
  });

  // Logs that all subject links have now been scraped
  console.log(
    'Scraped all subject links from: https://calendar.uoguelph.ca/undergraduate-calendar/course-descriptions/',
  );

  // Creates a new file named "ScrapedCourses.json"
  // if it does not already exist and leaves an empty array
  fs.writeFile('ScrapedGuelphCourses.json', JSON.stringify([]), (error) => {
    if (error) throw error;
  });

  // Traverses through all the course type anchor links, (ACCT, AGR, ANSC, ANTH, etc.)
  for (let i = 0; i < courseTypeLink.length; i += 1) {
    // Opens the current anchor link and selects the "textcontainer" ID
    // as this container holds all the information regarding the courses
    // eslint-disable-next-line no-await-in-loop
    await page.goto(courseTypeLink[i]);
    // eslint-disable-next-line no-await-in-loop
    const scrapeToFile = await page.$eval(
      '#textcontainer',
      (headContainer) => {
        // Grabs all classes with courseblocks, each courseblock contains all information
        // regarding a specific post, (ACCT1220, ACT1240, etc.)
        const courseBlocks = headContainer.getElementsByClassName('courseblock');

        const courseArr = [];

        // Traverses through all the course blocks
        for (let j = 0; j < courseBlocks.length; j += 1) {
          // Variables that hold all course information
          let courseCode = '';
          let courseName = '';
          let seasonsOffered = '';
          let numberLectures = '(';
          let courseWeight = '';
          let courseDescription = '';
          let courseOffering = '';
          let coursePrerequisite = '';
          let coursePrerequisiteArray = [];
          let courseEquate = '';
          let courseRestriction = '';
          let courseDepartment = '';
          let courseLocation = '';

          // Scrapes the course code, the if statements below work similarily,
          // tries to retrieve the course code class, if it does not equal 0 it means that the
          // course code exist and can be scraped
          if (
            courseBlocks[j].getElementsByClassName('detail-code')
              .length !== 0
          ) {
            courseCode += courseBlocks[j]
              .getElementsByClassName('detail-code')[0]
              .getElementsByTagName('strong')[0].innerHTML;
          }

          // Scrapes the course title
          if (
            courseBlocks[j].getElementsByClassName('detail-title')
              .length !== 0
          ) {
            courseName += courseBlocks[j]
              .getElementsByClassName('detail-title')[0]
              .getElementsByTagName('strong')[0]
              .innerHTML.replace(/\s+/g, ' ')
              .trim()
              .replaceAll('&amp;', '&');
          }

          // Scrapes the seasons offered for the course
          if (
            courseBlocks[j].getElementsByClassName(
              'detail-typically_offered',
            ).length !== 0
          ) {
            seasonsOffered += courseBlocks[j]
              .getElementsByClassName(
                'detail-typically_offered',
              )[0]
              .getElementsByTagName('strong')[0]
              .getElementsByTagName('span')[0]
              .innerHTML.replaceAll('&amp;', '&');
          }

          // Scrapes the number of lectures for the course
          if (
            courseBlocks[j].getElementsByClassName(
              'detail-inst_method',
            ).length !== 0
          ) {
            numberLectures += courseBlocks[j]
              .getElementsByClassName('detail-inst_method')[0]
              .getElementsByTagName('strong')[0]
              .getElementsByTagName('span')[0].innerHTML;
            numberLectures += ')';
          } else {
            numberLectures = '';
          }

          // Scrapes the course weight
          if (
            courseBlocks[j].getElementsByClassName(
              'detail-hours_html',
            ).length !== 0
          ) {
            courseWeight += courseBlocks[j]
              .getElementsByClassName('detail-hours_html')[0]
              .getElementsByTagName('strong')[0].innerHTML;
          }

          // Scrapes the course description
          if (
            courseBlocks[j].getElementsByClassName(
              'courseblockextra',
            ).length !== 0
          ) {
            courseDescription += courseBlocks[j]
              .getElementsByClassName('courseblockextra')[0]
              .innerHTML.replaceAll(/<\/?a[^>]*>/g, '')
              .replace(/\s+/g, ' ')
              .trim()
              .replaceAll('&amp;', '&');
          }

          // Scrapes the offerings of the course
          if (
            courseBlocks[j].getElementsByClassName(
              'detail-offering',
            ).length !== 0
          ) {
            courseOffering += courseBlocks[j]
              .getElementsByClassName('detail-offering')[0]
              .getElementsByTagName('span')[0]
              .innerHTML.replaceAll('&amp;', '&');
          }

          // Scrapes the prerequisites of the course
          if (
            courseBlocks[j].getElementsByClassName(
              'detail-prerequisite_s_',
            ).length !== 0
          ) {
            coursePrerequisite += courseBlocks[j]
              .getElementsByClassName('detail-prerequisite_s_')[0]
              .getElementsByTagName('span')[0]
              .innerHTML.replaceAll(/<\/?a[^>]*>/g, '')
              .replaceAll('&amp;', '&');

            // let inBrackets = 0;
            coursePrerequisiteArray = [];
            let builtString = '';

            let inSqBrackets = 0;
            let inRdBrackets = 0;

            // Loop through the word
            for (let k = 0; k < coursePrerequisite.length; k += 1) {
              // Check if you are still within brackets
              if (coursePrerequisite[k] === '[') inSqBrackets += 1;
              if (coursePrerequisite[k] === ']') inSqBrackets -= 1;
              if (inSqBrackets === 0) {
                if (coursePrerequisite[k] === '(') inRdBrackets += 1;
                if (coursePrerequisite[k] === ')') inRdBrackets -= 1;
              }

              // If i is a comma that is not inside brackets
              // push the current built coursePrerequisite
              if (
                coursePrerequisite[k] === ','
                && inSqBrackets === 0
                && inRdBrackets === 0
              ) {
                coursePrerequisiteArray.push(builtString);
                builtString = '';
                k += 1;
              } else {
                builtString += coursePrerequisite[k];

                // If k is the last character push the current built coursePrerequisite
                if (k === coursePrerequisite.length - 1) {
                  coursePrerequisiteArray.push(builtString);
                }
              }
            }
          }

          // Scrapes the equates of the course
          if (
            courseBlocks[j].getElementsByClassName(
              'detail-equate_s_',
            ).length !== 0
          ) {
            courseEquate += courseBlocks[j]
              .getElementsByClassName('detail-equate_s_')[0]
              .getElementsByTagName('span')[0]
              .innerHTML.replaceAll(/<\/?a[^>]*>/g, '')
              .replaceAll('&amp;', '&');
          }

          // Scrapes the restrictions of the course
          if (
            courseBlocks[j].getElementsByClassName(
              'detail-restriction_s_',
            ).length !== 0
          ) {
            courseRestriction += courseBlocks[j]
              .getElementsByClassName('detail-restriction_s_')[0]
              .getElementsByTagName('span')[0]
              .innerHTML.replaceAll(/<\/?a[^>]*>/g, '')
              .replaceAll('&amp;', '&');
          }

          // Scrapes the departments of the course
          if (
            courseBlocks[j].getElementsByClassName(
              'detail-department_s_',
            ).length !== 0
          ) {
            courseDepartment += courseBlocks[j]
              .getElementsByClassName('detail-department_s_')[0]
              .getElementsByTagName('span')[0]
              .innerHTML.replace(/\s+/g, ' ')
              .trim()
              .replaceAll('&amp;', '&');
          }

          // Scrapes the location of the course
          if (
            courseBlocks[j].getElementsByClassName(
              'detail-location_s_',
            ).length !== 0
          ) {
            courseLocation += courseBlocks[j]
              .getElementsByClassName('detail-location_s_')[0]
              .getElementsByTagName('span')[0]
              .innerHTML.replace(/\s+/g, ' ')
              .trim()
              .replaceAll('&amp;', '&');
          }

          // Creates a new JSON and stores all the course information for the current course
          const course = {
            CourseCode: courseCode,
            CourseName: courseName,
            CourseSeasons: seasonsOffered,
            CourseLectures: numberLectures,
            CourseWeight: courseWeight,
            CourseDescription: courseDescription,
            CourseOffering: courseOffering,
            CoursePrerequisite: coursePrerequisiteArray,
            CourseEquate: courseEquate,
            CourseRestriction: courseRestriction,
            CourseDepartment: courseDepartment,
            CourseLocation: courseLocation,
          };

          courseArr.push(course);
        }

        return courseArr;
      },
    );

    // Stores all scraped courses into scrapedCourses variable
    // and stores the course subject of all those courses
    const scrapedCourses = scrapeToFile;
    const courseSubject = scrapedCourses[0].CourseCode.split('*')[0];

    // Logs the current course subject that was scraped with formatting and colour
    console.log(
      `Scraped all courses for subject \x1b[93m${courseSubject}\x1b[39m from: ${courseTypeLink[i]}`,
    );

    // Appends the scraped course information onto the "ScrapedCourse.json" text file
    fs.readFile('ScrapedGuelphCourses.json', (err, data) => {
      let json = JSON.parse(data);
      json = json.concat(scrapedCourses);

      fs.writeFile(
        'ScrapedGuelphCourses.json',
        JSON.stringify(json),
        (error) => {
          if (error) throw error;
        },
      );
    });
  }

  // Closes the browser instance created above
  await browser.close();
  console.log('\x1b[93mUniversity of Guelph\x1b[39m Course Information Gathered! Exiting...');
}

console.log('Gathering all \x1b[93mUniversity of Guelph\x1b[39m Course Information...');
runGuelphCourseScraper();
