import readline from 'readline';
import searchCourseMultiValue from './coursesearch.js';
import sort from './coursesort.js';
import { courseCodeBinSearch, load, sleep } from './util.js';
import { makegraph } from './makegraphUOG.js';
import { makegraphUBCSubjects, makegraphProgramUBC, mergeGraphs } from './makegraphUBC.js';

/**
 * Prints a course in a detailed format
 * @param {JSON} result
 */
function detailedResult(result) {
  console.log('');

  const attrs = Object.keys(result);

  for (let i = 0; i < attrs.length; i += 1) {
    const attr = attrs[i];

    if (result[attr] !== '') {
      console.log(`${attr.replace('Course', '')}: ${result[attr]}`);
    }
  }
}

/**
 * Prints all the course codes contained in results from the initial search
 * @param {Array} Results
 */
function printResults(Results) {
  if (Results.length === 0) {
    console.log('No results found.');
    process.exit(0);
  }

  console.log('\nResults:');

  Results.forEach((course) => {
    console.log(`-> ${course.CourseCode}`);
  });
}

/**
 * Prompts for the detailed view of a course within results
 * @param {Array} Results
 */
function promptDetailedView(Results) {
  // Creates an interface for I/O
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Function that recursively loops, allowing users to choose courses to view in detail
  const recursiveAsyncPrompt = () => {
    // Gets the user input on which course they want to see in detail
    console.log('\n+------------------------------------------------+');
    console.log("Enter a course from the results to see it in detail\nType 'showlist' to show the results of the search again\nType 'exit' to exit\n");
    rl.question('Choice: ', (input) => {
      let found = 0;
      // allow a way to exit the loop
      if (input === 'exit') {
        return rl.close();
      }

      // Prompts the user for an action after the list of courses are displayed
      if (input === 'showlist') {
        printResults(Results);
      }

      if (input !== 'showlist') {
        found = courseCodeBinSearch(Results, input);
      }

      if (found !== -1 && input !== 'showlist') {
        detailedResult(Results[found]);
      }

      if (found === -1) {
        console.log("\nThat course was not on the list of results.\nTry 'showlist' for the list of courses from the results");
      }

      recursiveAsyncPrompt();

      return null;
    });
  };

  recursiveAsyncPrompt();

  // Exiting the created interface
  rl.on('close', () => {
    console.log('\nExiting...\n');
    return null;
  });
}

/**
 * Sets the filter according to the flags entered by the user in command line
 * @param {JSON} filterObj
 * @param {Array} args
 * @returns Filter object
 */
function setFlags(filterObj, args) {
  const obj = { ...filterObj };

  // A dictionary to easily reference a filter you want
  const flagLetter = {
    c: 'CourseCode',
    n: 'CourseName',
    s: 'CourseSeasons',
    C: 'CourseWeight',
    d: 'CourseDescription',
    o: 'CourseOffering',
    r: 'CourseRestriction',
    D: 'CourseDepartment',
    L: 'CourseLocation',
    p: 'CoursePrerequisite',
    e: 'CourseEquate',
  };

  // Loop through each argument
  for (let i = 0; i < args.length; i += 1) {
    // if the argument is a character and the next index would not exceed list length
    if (args[i].length === 1 && (i + 1) < args.length) {
      let val = args[i + 1];

      if (args[i] === 'C') {
        val = parseFloat(args[i + 1]).toFixed(2);
      }

      // set the flag as the succeeding value
      obj[flagLetter[args[i]]] = val;
      i += 1;
    } else {
      // Unexpected flags go into otherterms
      obj.OtherTerms.push(args[i]);
    }
  }

  return obj;
}

/**
 * Output the help menu
 */
function helpFunction() {
  console.log('--- Course Search ---');
  console.log('Search Filters:');
  console.log('<c CourseCode>');
  console.log('<n CourseName>');
  console.log('<s Seasons>');
  console.log('<C Credits>');
  console.log('<d Description>');
  console.log('<o Offering(s)>');
  console.log('<r Restriction(s)>');
  console.log('<D Department(s)>');
  console.log('<L Location(s)>');
  console.log('<p Prerequisites(s)>');
  console.log('<e Equate(s)>');

  console.log('\nAlternatively with no search terms the system will best try to figure out what you are searching for.\n');
  console.log('An example of a search could be:\n$ npm start c CIS s Summer C 0.5\nto find all summer CIS courses worth 0.5 credits\n');

  console.log('\n--- Make Graph - University of Guelph ---');
  console.log('These execution options pertain to the University of Guelph');
  console.log('Execution:');
  console.log('<npm start makegraph course/subject>');
  console.log('<npm start makegraph M major>');
  console.log('<npm start makegraph m minor>');
  console.log('<npm start makegraph M showlist> to see all the availble majors');
  console.log('<npm start makegraph m showlist> to see all the availble minors');
  console.log('<npm start makegraph N major full name>');
  console.log('<npm start makegraph n minor full name>');
  console.log('\nThis program can create graphs of prerequisites for courses or subjects, CIS*3110 and ACCT are both valid inputs');
  console.log('Examples of make graph:\n$ npm start makegraph "CIS*3100"\n$ npm start makegraph BIOC\n');

  console.log('\n--- Make Graph - University of British Columbia ---');
  console.log('These execution options pertain to the University of British Columbia');
  console.log('Execution:');
  console.log('<npm start makegraph UBC subjects> to graph all the UBC subjects');
  console.log('<npm start makegraph UBC majors> to graph all the UBC majors\n');
}

/**
 * Output the list for major or minor
 * @param {Boolean} - true if is major, false if is minor
 * @param {JSON} - major json object
 */
function showlistMakegraph(isMajor, majorsJSON) {
  /* Check if it's major or minor */
  if (isMajor) {
    console.log('Major List: ');
  } else {
    console.log('Minor List: ');
  }

  // Get the first degree name
  let { degreeName } = majorsJSON[0];

  // If there are majors/minors under the first degree, output it's name
  if (majorsJSON[0].majorInformation.major === isMajor) {
    console.log(degreeName);
  }
  // Loop through and output all the program code
  majorsJSON.forEach((JSON) => {
    if (JSON.majorInformation.major === isMajor) {
      const tempName = JSON.degreeName;

      // If degree name has not been outputted, do it
      if (degreeName.localeCompare(tempName) !== 0) {
        console.log(tempName);
        degreeName = tempName;
      }
      console.log(`> ${JSON.programCode}`);
    }
  });
}

/**
 * The main program for the CLI containing all prompts and messages for the user.
 * @param {Array} clargs
 */
async function cli(clargs) {
  const majorsJSON = await load('./GuelphMajorCourses.json');
  let coursesJSON = await load('./ScrapedGuelphCourses.json');
  const majorsUBCJSON = await load('./UBCMajorCourses.json');
  const allUBCCourses = await load('./ScrapedUBCCourses.json');

  // sort the courses alphabetically by course code
  coursesJSON = sort(coursesJSON);

  // Check if all that was typed was npm start
  if (clargs.length === 2) {
    console.log('No search terms were found !\nTry:\n$ npm start help\nfor all our options.\n');
  }

  // Check if npm start help was typed
  if (clargs.length === 3 && clargs[2].includes('help')) {
    helpFunction();
    return;
  }

  // An Object to store each of the arguments into their resp
  let filterObj = {
    CourseCode: '---',
    CourseName: '---',
    CourseSeasons: '---',
    CourseWeight: '---',
    CourseDescription: '---',
    CourseOffering: '---',
    CourseRestriction: '---',
    CourseDepartment: '---',
    CourseLocation: '---',
    CoursePrerequisite: '---',
    CourseEquate: '---',
    OtherTerms: [],
  };

  // If the user entered an argument to makegraph, creates it based off user input
  if (clargs.length >= 3 && clargs[2].includes('makegraph')) {
    // Error check to ensure user entered a course/subject to be made
    if (clargs.length === 3) {
      console.log('An argument was expected after makegraph. None was provided. Exiting...\n');
      return;
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const makegraphLoop = async (clArgs) => {
      let flag = 'None';
      let subject = clArgs[0].toUpperCase(); // change it to uppercase so it's case insensitive
      if (clArgs[0].length === 1 && clArgs.length > 1) {
        [flag] = clArgs;
        subject = clArgs[1].toUpperCase(); // change it to uppercase so it's case insensitive
      }

      if (subject === 'UBC' || flag.toLowerCase() === 'university' || flag.toLowerCase() === 'ubc') {
        const graphType = clArgs[1].toLowerCase();

        if (graphType === 'subjects' || graphType === 'subject') {
          console.log('Making graphs for all subjects in UBC');
          makegraphUBCSubjects(allUBCCourses);
          await sleep(10000);
          mergeGraphs('subjects');
          console.log('Subjects of UBC graphed successfully');
        }
        else if (graphType === 'majors' || graphType === 'major') {
          console.log('Making graphs for all majors in UBC');
          makegraphProgramUBC(majorsUBCJSON, allUBCCourses);
          await sleep(10000);
          mergeGraphs('majors');
          console.log('majors of UBC graphed successfully');
        }

        rl.close();
        // eslint-disable-next-line brace-style
      }

      else if (subject.localeCompare('SHOWLIST') === 0) {
        if (flag === 'M') {
          showlistMakegraph(true, majorsJSON);
        } else if (flag === 'm') {
          showlistMakegraph(false, majorsJSON);
        }
        console.log('\n+------------------------------------------------+');
        console.log("Enter another term to create a graph for like \"ACCT\" without the \"npm start makegraph\", or type \"M CS\" to create a graph for CS Major, type 'exit' to exit.");
        rl.question('> ', (input) => {
          if (input.toLowerCase() === 'exit') {
            rl.close();
            return;
          }
          const splitInput = input.split(' ');
          makegraphLoop(splitInput);
        });
      } else {
        // Parses the course/subject the user wants to create a graph of and logs it to the user
        console.log(`\nMaking a graph for ${subject}`);

        // Creates the graph based off the course/subject and logs it to the user
        filterObj.CourseCode = subject;
        let filename = `${subject}graph`;
        console.log(`What would you like to name the file (Default is ${filename})?`);
        console.log('(Warning! Any special character (ex. ?!*) will be removed from the filename)');
        rl.question('> ', (name) => {
          if (name.length !== 0) filename = name;
          // Remove any restricted characters or extensions
          filename = filename.replace('.pdf', '');
          filename = filename.replace(/[^a-zA-Z0-9 ]/g, '');

          const status = makegraph(coursesJSON, majorsJSON, flag, subject, filterObj, filename);

          if (status !== -1) console.log(`${subject} graph successfully created. The graph can be found in ./graphs/${filename}.pdf`);
          console.log("Enter another term to create a graph for like \"ACCT\" without the \"npm start makegraph\", or type \"M CS\" to create a graph for CS Major, type 'exit' to exit.");
          rl.question('> ', (input) => {
            if (input.toLowerCase() === 'exit') {
              rl.close();
              return;
            }
            const splitInput = input.split(' ');
            makegraphLoop(splitInput);
          });
        });
      }
    };
    clargs.shift();
    clargs.shift();
    clargs.shift();
    makegraphLoop(clargs);
    rl.on('close', () => {
      console.log('\nExiting...\n');
      return null;
    });

    return;
  }

  // Copy the command line arguments but remove the first two as they are irrelevant
  const flags = [...clargs];
  flags.shift();
  flags.shift();

  // Sets any course search flags inputted by the user
  filterObj = setFlags(filterObj, flags);

  // Filters the course search flags, reads in the ScrapeCourses.json file
  // and searches through all the courses returning courses found
  const results = searchCourseMultiValue(coursesJSON, filterObj);

  // Prints the resulting courses from the user course search and prompts them
  if (results.length === 1) {
    detailedResult(results[0]);
    console.log('\n+------------------------------------------------+\nExiting...');
  } else {
    printResults(results);
    promptDetailedView(results);
  }
}

// Calls the cli function and sends the arguments
cli(process.argv);

export default cli;
