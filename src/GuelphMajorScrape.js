import playwright from 'playwright';
import * as fs from 'fs';

// Scrapes all University of Guelph degrees and its courses
const getGuelphMajorCourses = async () => {
  // Opens a browser instance and a new page
  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Makes the page go to the below url and target the div with the 'sitemap' class
  await page.goto('https://calendar.uoguelph.ca/undergraduate-calendar/degree-programs/');
  const degreeLinks = await page.$eval('.sitemap', (headContainer) => {
    // Scrapes all the anchor tags inside the targetted div above
    const anchorTags = headContainer.getElementsByTagName('a');

    // Stores all the href attributes of the anchor tags and returns it
    const links = [];
    for (let i = 0; i < anchorTags.length; i += 1) {
      links.push(anchorTags[i].href);
    }

    return links;
  });

  // Logs to the user that all the degree links have now been scraped
  console.log('Scraped all degree links from: https://calendar.uoguelph.ca/undergraduate-calendar/degree-programs/\n');

  // Traverses through the links of degrees and stores all program links
  // with degrees containing a programs tab in gatheredLinks.
  // Special cases are stored inside gatheredProgramsSpecial
  const gatheredPrograms = [];
  const gatheredProgramsSpecial = [];
  for (let i = 0; i < degreeLinks.length; i += 1) {
    // Storing special cases inside gatheredProgramsSpecial
    if (i === 2) {
      gatheredProgramsSpecial.push(degreeLinks[i]);
      i += 1;
    } else if (i === 7) {
      gatheredProgramsSpecial.push(degreeLinks[i]);
      i += 1;
      gatheredProgramsSpecial.push(degreeLinks[i]);
      i += 1;
    } else if (i === 12) {
      gatheredProgramsSpecial.push(degreeLinks[i]);
      i += 1;
      gatheredProgramsSpecial.push(degreeLinks[i]);
      break;
    }

    // Goes to the current degree link and targets the div with the 'sitemap' class
    // eslint-disable-next-line no-await-in-loop
    await page.goto(degreeLinks[i]);
    // eslint-disable-next-line no-await-in-loop
    const programLinks = await page.$eval('.sitemap', (headContainer) => {
      // Scrapes all the anchor tags inside the above targetted div which will be the links
      // to all the programs in the degree
      const anchorTags = headContainer.getElementsByTagName('a');

      // Stores the anchor html text and href of all anchor tags scraped
      const links = [];
      for (let j = 0; j < anchorTags.length; j += 1) {
        const json = { programName: anchorTags[j].innerHTML, programLink: anchorTags[j].href };
        links.push(json);
      }

      return links;
    });

    // Scrapes the 'page-title' class which holds the degree name within the innerHTML
    // eslint-disable-next-line no-await-in-loop
    const getDegreeName = await page.$eval('.page-title', (degreeTitle) => degreeTitle.innerHTML);

    // Goes through all the program links of the current degree and stores within gatheredPrograms
    for (let j = 0; j < programLinks.length; j += 1) {
      const json = {
        degreeName: getDegreeName,
        programName: programLinks[j].programName,
        programLink: programLinks[j].programLink,
      };
      gatheredPrograms.push(json);
    }

    // Logs that all programs of the current degree have been scraped
    console.log(`Scraped all majors for degree: \x1b[93m${getDegreeName}\x1b[39m from: ${degreeLinks[i]}`);
  }
  console.log(''); // for some reason console.log('\n') was creating 2 new lines so left an empty string for 1 new line

  // Traverses through all the programs links scraped and
  // stores information inside programInformation
  const programInformation = [];
  for (let i = 0; i < gatheredPrograms.length; i += 1) {
    // Opens the current program link and taragets the div with an id 'requirementstextcontainer'
    // eslint-disable-next-line no-await-in-loop
    await page.goto(gatheredPrograms[i].programLink);
    // eslint-disable-next-line no-await-in-loop
    const courses = await page.$eval('#requirementstextcontainer', (headContainer) => {
      // Variables to hold major and minor information
      let majorTableNumber = 0;
      let minorTableNumber = 0;
      let noMajor = false;
      let noMinor = false;
      const majorCourses = [];
      const majorExtraInformation = [];
      const minorCourses = [];
      const minorExtraInformation = [];

      // Scrapes all header in the requirementstextcontainer
      const headerTag = headContainer.querySelectorAll('h2, h3, h1, h4');

      // Traverses through the header tag finding locating the major
      // header which corresponds to the major table
      // if the major header tag is the 2nd header tag on that page, means the
      // 2nd table on that page holds the major information
      for (let j = 0; j < headerTag.length; j += 1) {
        if (headerTag[j].innerHTML.includes('major') || headerTag[j].innerHTML.includes('Major')) {
          majorTableNumber = j;
          break;
        }
        if (j === headerTag.length - 1) {
          noMajor = true;
        }
      }

      // Same concept as the above for loop but for minor table
      for (let j = 0; j < headerTag.length; j += 1) {
        if (headerTag[j].innerHTML.includes('minor') || headerTag[j].innerHTML.includes('Minor')) {
          minorTableNumber = j;
          break;
        }
        if (j === headerTag.length - 1) {
          noMinor = true;
        }
      }

      // Scrapes the all tables in the div with id requirementstextcontainer
      const courseTable = headContainer.getElementsByTagName('table');

      // If there is a major and associated table with the major
      if (noMajor === false && majorTableNumber < courseTable.length) {
        // Gets the body of the major table
        const courseBody = courseTable[majorTableNumber].getElementsByTagName('tbody');

        // Grabs all anchor tags and traverses, storing all the course names
        const anchorTags = courseBody[0].getElementsByTagName('a');
        for (let j = 0; j < anchorTags.length; j += 1) {
          if (!majorCourses.includes(anchorTags[j].title)) {
            majorCourses.push(anchorTags[j].title);
          }
        }

        // Grabs all extra information in major table
        const extraRequirements = courseBody[0].getElementsByClassName('courselistcomment');
        for (let j = 0; j < extraRequirements.length; j += 1) {
          majorExtraInformation.push(extraRequirements[j].innerHTML.replaceAll(/<\/?a[^>]*>/g, ''));
        }
      }

      // If there is a minor and associated table with the minor
      if (noMinor === false && minorTableNumber < courseTable.length) {
        // Gets the body of the minor table
        const courseBody = courseTable[minorTableNumber].getElementsByTagName('tbody');

        // Grabs all anchor tags and traverses, storing all the course names
        const anchorTags = courseBody[0].getElementsByTagName('a');
        for (let j = 0; j < anchorTags.length; j += 1) {
          if (!minorCourses.includes(anchorTags[j].title)) {
            minorCourses.push(anchorTags[j].title);
          }
        }

        // Grabs all extra information in the minor table
        const extraRequirements = courseBody[0].getElementsByClassName('courselistcomment');
        for (let j = 0; j < extraRequirements.length; j += 1) {
          minorExtraInformation.push(extraRequirements[j].innerHTML.replaceAll(/<\/?a[^>]*>/g, ''));
        }
      }

      // Returns the courses and extra information in the major at index 0 and minor at index 1
      const programArray = [];
      const majorInformationJSON = {
        courses: majorCourses,
        extraInformation: majorExtraInformation,
        major: !noMajor,
      };
      const minorInformationJSON = {
        courses: minorCourses,
        extraInformation: minorExtraInformation,
        minor: !noMinor,
      };
      programArray.push(majorInformationJSON);
      programArray.push(minorInformationJSON);
      return programArray;
    });

    // Gets the program/degree code stored in the parentheses in the program/degree names
    const programCode = gatheredPrograms[i].programName.match(/\((.*?)\)/);
    const degreeCode = gatheredPrograms[i].degreeName.match(/\((.*?)\)/);

    // Adds the various information in the program and pushes it onto the array
    const programInformationJSON = {
      degreeName: gatheredPrograms[i].degreeName,
      degreeCode: degreeCode[1],
      programName: gatheredPrograms[i].programName,
      programCode: programCode[1],
      majorInformation: courses[0],
      minorInformation: courses[1],
    };
    programInformation.push(programInformationJSON);

    // Logs that all courses have been scraped for the current program
    console.log(`Scraped all courses for program: \x1b[93m${gatheredPrograms[i].programName}\x1b[39m from: ${gatheredPrograms[i].programLink}`);
  }

  // Section to handle the special degrees
  // Scrapes the B.A.S degree Science Core information
  await page.goto(gatheredProgramsSpecial[0]);
  const BASS = await page.$eval('#requirementstextcontainer', (headContainer) => {
    const majorCourses = [];
    const majorExtraInformation = [];

    // Scrapes all the tables and gets the table body of the first table
    const courseTable = headContainer.getElementsByTagName('table');
    const courseBody = courseTable[0].getElementsByTagName('tbody');

    // Scrapes all the anchor tags from the scraped table body and stores all the course titles
    const anchorTags = courseBody[0].getElementsByTagName('a');
    for (let i = 0; i < anchorTags.length; i += 1) {
      if (!majorCourses.includes(anchorTags[i].title)) {
        majorCourses.push(anchorTags[i].title);
      }
    }

    // Scrapes all the extra information stored in the scraped table body
    const extraRequirements = courseBody[0].getElementsByClassName('courselistcomment');
    for (let i = 0; i < extraRequirements.length; i += 1) {
      majorExtraInformation.push(extraRequirements[i].innerHTML.replaceAll(/<\/?a[^>]*>/g, ''));
    }

    // Pushes the major and minor information for the BAS degree science core and
    // returns it, minor is included just so jsons stay consistent with above general cases
    const programArray = [];
    const majorInformationJSON = {
      courses: majorCourses,
      extraInformation: majorExtraInformation,
      major: true,
    };
    const minorInformationJSON = { courses: [], extraInformation: [], minor: false };
    programArray.push(majorInformationJSON);
    programArray.push(minorInformationJSON);
    return programArray;
  });

  // Pushes the BAS degree science core onto the program information and logs it
  const programInformationJSONBASS = {
    degreeName: 'Bachelor of Arts and Sciences (B.A.S.) Science Core', degreeCode: 'B.A.S.S', progrmaName: 'Bachelor of Arts and Sciences (B.A.S.) Science Core', programCode: 'B.A.S.S', majorInformation: BASS[0], minorInformation: BASS[1],
  };
  programInformation.push(programInformationJSONBASS);
  console.log('Special Case: Degree is the major: \x1b[93mB.A.S.\x1b[39m and scraped all courses for the science core. Code is: \x1b[93mB.A.S.S\x1b[39m');

  // Scrapes the BAS degree Subject Area Core information
  const BASA = await page.$eval('#requirementstextcontainer', (headContainer) => {
    const majorCourses = [];
    const majorExtraInformation = [];

    // Scrapes all the tables and gets the table body of the first table
    const courseTable = headContainer.getElementsByTagName('table');
    const courseBody = courseTable[1].getElementsByTagName('tbody');

    // Scrapes all the anchor tags from the scraped table body and stores all the course titles
    const anchorTags = courseBody[0].getElementsByTagName('a');
    for (let i = 0; i < anchorTags.length; i += 1) {
      if (!majorCourses.includes(anchorTags[i].title)) {
        majorCourses.push(anchorTags[i].title);
      }
    }

    // Scrapes all the extra information stored in the scraped table body
    const extraRequirements = courseBody[0].getElementsByClassName('courselistcomment');
    for (let i = 0; i < extraRequirements.length; i += 1) {
      majorExtraInformation.push(extraRequirements[i].innerHTML.replaceAll(/<\/?a[^>]*>/g, ''));
    }

    // Pushes the major and minor information for the BAS degree science core
    // and returns it, minor is included just so jsons stay consistent with above general cases
    const programArray = [];
    const majorInformationJSON = {
      courses: majorCourses,
      extraInformation: majorExtraInformation,
      major: true,
    };
    const minorInformationJSON = { courses: [], extraInformation: [], minor: false };
    programArray.push(majorInformationJSON);
    programArray.push(minorInformationJSON);
    return programArray;
  });

  // Pushes the BAS degree science core onto the program information and logs it
  const programInformationJSONBASA = {
    degreeName: 'Bachelor of Arts and Sciences (B.A.S.) Subject Area Core', degreeCode: 'B.A.S.A', progrmaName: 'Bachelor of Arts and Sciences (B.A.S.) Subject Area Core', programCode: 'B.A.S.A', majorInformation: BASA[0], minorInformation: BASA[1],
  };
  programInformation.push(programInformationJSONBASA);
  console.log('Special Case: Degree is the major: \x1b[93mB.A.S.\x1b[39m and scraped all courses for the subject area core. Code is: \x1b[93mB.A.S.A\x1b[39m');

  // Scrapes the non-coop BIESP
  await page.goto(gatheredProgramsSpecial[1]);
  // Scrapes the non-coop BIESP requirements
  const BIESP = await page.$eval('#requirementstextcontainer', (headContainer) => {
    const courses = [];
    const extraInformation = [];

    // Scrapes all the tables and gets the table body of the first table
    const courseTable = headContainer.getElementsByTagName('table');
    const courseBody = courseTable[0].getElementsByTagName('tbody');

    // Scrapes all the anchor tags from the scraped table body and stores all the course titles
    const anchorTags = courseBody[0].getElementsByTagName('a');
    for (let i = 0; i < anchorTags.length; i += 1) {
      if (!courses.includes(anchorTags[i].title)) {
        courses.push(anchorTags[i].title);
      }
    }

    // Scrapes all the extra information stored in the scraped table body
    const extraRequirements = courseBody[0].getElementsByClassName('courselistcomment');
    for (let i = 0; i < extraRequirements.length; i += 1) {
      extraInformation.push(extraRequirements[i].innerHTML.replaceAll(/<\/?a[^>]*>/g, ''));
    }

    // Pushes the major and minor information for the BIESP degree and
    // returns it, minor is included just so jsons stay consistent with above general cases
    const programArray = [];
    const majorInformationJSON = { courses, extraInformation, major: true };
    const minorInformationJSON = { courses: [], extraInformation: [], minor: false };
    programArray.push(majorInformationJSON);
    programArray.push(minorInformationJSON);
    return programArray;
  });

  // Pushes the BIESP degree onto the program information and logs it
  const programInformationJSONBIESP = {
    degreeName: 'Bachelor of Indigenous Environmental Science and Practice (BIESP)', degreeCode: 'BIESP', progrmaName: 'Bachelor of Indigenous Environmental Science and Practice (BIESP)', programCode: 'BIESP', majorInformation: BIESP[0], minorInformation: BIESP[1],
  };
  programInformation.push(programInformationJSONBIESP);
  console.log('Special Case: Degree is the major: \x1b[93mBIESP\x1b[39m and scraped all non-coop courses for it. Code is: \x1b[93mBIESP\x1b[39m');

  // Scrapes the coop BIESP
  const BIESPC = await page.$eval('#requirementscooptextcontainer', (headContainer) => {
    const courses = [];
    const extraInformation = [];

    // Scrapes all the tables and gets the table body of the third table
    const courseTable = headContainer.getElementsByTagName('table');
    const courseBody = courseTable[2].getElementsByTagName('tbody');

    // Scrapes all the anchor tags from the scraped table body and stores all the course titles
    const anchorTags = courseBody[0].getElementsByTagName('a');
    for (let i = 0; i < anchorTags.length; i += 1) {
      if (!courses.includes(anchorTags[i].title)) {
        courses.push(anchorTags[i].title);
      }
    }

    // Scrapes all the extra information stored in the scraped table body
    const extraRequirements = courseBody[0].getElementsByClassName('courselistcomment');
    for (let i = 0; i < extraRequirements.length; i += 1) {
      extraInformation.push(extraRequirements[i].innerHTML.replaceAll(/<\/?a[^>]*>/g, ''));
    }

    // Pushes the major and minor information for the BIESP COOP degree and
    // returns it, minor is included just so jsons stay consistent with above general cases
    const programArray = [];
    const majorInformationJSON = { courses, extraInformation, major: true };
    const minorInformationJSON = { courses: [], extraInformation: [], minor: false };
    programArray.push(majorInformationJSON);
    programArray.push(minorInformationJSON);
    return programArray;
  });

  // Pushes the BIESP COOP onto the program information and logs it
  const programInformationJSONBIESPC = {
    degreeName: 'Bachelor of Indigenous Environmental Science and Practice (BIESPC)', degreeCode: 'BIESPC', progrmaName: 'Bachelor of Indigenous Environmental Science and Practice (BIESPC)', programCode: 'BIESPC', majorInformation: BIESPC[0], minorInformation: BIESPC[1],
  };
  programInformation.push(programInformationJSONBIESPC);
  console.log('Special Case: Degree is the major: \x1b[93mBIESP\x1b[39m and scraped all coop courses for it. Code is: \x1b[93mBIESPC\x1b[39m');

  // Scrapes the BLA degree
  await page.goto(gatheredProgramsSpecial[2]);
  const BLA = await page.$eval('#requirementstextcontainer', (headContainer) => {
    const courses = [];
    const extraInformation = [];

    // Scrapes all the tables and gets the table body of the third table
    const courseTable = headContainer.getElementsByTagName('table');
    const courseBody = courseTable[0].getElementsByTagName('tbody');

    // Scrapes all the anchor tags from the scraped table body and stores all the course titles
    const anchorTags = courseBody[0].getElementsByTagName('a');
    for (let i = 0; i < anchorTags.length; i += 1) {
      if (!courses.includes(anchorTags[i].title)) {
        courses.push(anchorTags[i].title);
      }
    }

    // Scrapes all the extra information stored in the scraped table body
    const extraRequirements = courseBody[0].getElementsByClassName('courselistcomment');
    for (let i = 0; i < extraRequirements.length; i += 1) {
      extraInformation.push(extraRequirements[i].innerHTML.replaceAll(/<\/?a[^>]*>/g, ''));
    }

    // Pushes the major and minor information for the BLA degree and
    // returns it, minor is included just so jsons stay consistent with above general cases
    const programArray = [];
    const majorInformationJSON = { courses, extraInformation, major: true };
    const minorInformationJSON = { courses: [], extraInformation: [], minor: false };
    programArray.push(majorInformationJSON);
    programArray.push(minorInformationJSON);
    return programArray;
  });

  // Pushes the BLA onto the program information and logs it
  const programInformationJSONBLA = {
    degreeName: 'Bachelor of Landscrape Architecture (B.L.A.)', degreeCode: 'B.L.A.', progrmaName: 'Bachelor of Landscrape AArchitecture (B.L.A.)', programCode: 'B.L.A.', majorInformation: BLA[0], minorInformation: BLA[1],
  };
  programInformation.push(programInformationJSONBLA);
  console.log('Special Case: Degree is the major: \x1b[93mB.L.A.\x1b[39m and scraped all courses for it');

  // Scrapes the DVM degree
  await page.goto(gatheredProgramsSpecial[4]);
  const DVM = await page.$eval('#scheduleofstudiestextcontainer', (headContainer) => {
    const courses = [];
    const extraInformation = [];

    // Scrapes all the tables and gets the table body of the third table
    const courseTable = headContainer.getElementsByTagName('table');
    const courseBody = courseTable[0].getElementsByTagName('tbody');

    // Scrapes all the anchor tags from the scraped table body and stores all the course titles
    const anchorTags = courseBody[0].getElementsByTagName('a');
    for (let i = 0; i < anchorTags.length; i += 1) {
      if (!courses.includes(anchorTags[i].title)) {
        courses.push(anchorTags[i].title);
      }
    }

    // Scrapes all the extra information stored in the scraped table body
    const extraRequirements = courseBody[0].getElementsByClassName('courselistcomment');
    for (let i = 0; i < extraRequirements.length; i += 1) {
      extraInformation.push(extraRequirements[i].innerHTML.replaceAll(/<\/?a[^>]*>/g, ''));
    }

    // Pushes the major and minor information for the DVM degree and returns it,
    // minor is included just so jsons stay consistent with above general cases
    const programArray = [];
    const majorInformationJSON = { courses, extraInformation, major: true };
    const minorInformationJSON = { courses: [], extraInformation: [], minor: false };
    programArray.push(majorInformationJSON);
    programArray.push(minorInformationJSON);
    return programArray;
  });

  // Pushes the DVM onto the program information and logs it
  const programInformationJSONDVM = {
    degreeName: 'Doctor of Veterinary Medicine (D.V.M.)', degreeCode: 'D.V.M.', progrmaName: 'Doctor of Veterinary Medicine (D.V.M.)', programCode: 'D.V.M.', majorInformation: DVM[0], minorInformation: DVM[1],
  };
  programInformation.push(programInformationJSONDVM);
  console.log('Special Case: Degree is the major: \x1b[93mD.V.M.\x1b[39m and scraped all courses for it');

  // Writes all programs and its information to the 'GuelphMajorCourses.json' file
  fs.writeFile('GuelphMajorCourses.json', JSON.stringify(programInformation), (error) => {
    if (error) throw error;
  });

  // Logs that scraping all major courses is finished and closes the browser instance
  console.log('\x1b[93mUniversity of Guelph\x1b[39m Major Course Information Gathered and Stored in MajorScrape.json! Exiting...');
  await browser.close();
};

// Starts the program and runs the major scraper
console.log('Gathering \x1b[93mUniversity of Guelph\x1b[39m Major Course Information...');
getGuelphMajorCourses();
