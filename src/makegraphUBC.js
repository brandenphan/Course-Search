import graphviz from 'graphviz';
import fs from 'fs';
import { PDFDocument } from 'pdf-lib';
import {searchCourseByName} from './UBCcoursesearch.js';
import { sleep } from './util.js';

// const fsPromises = fs.promises;
// import PDFMerger from 'pdf-merger-js';

/**
 * Chooses a colour for the course depending on what year it should be taken
 * @param {Object} course
 * @returns string of the colour chosen
 */
function colourPicker(course) {
  const splitCourse = course.split(' ');
  const level = splitCourse[1][0];
  let colour;

  if (level === '0') colour = 'plum1';
  if (level === '1') colour = 'cyan3';
  if (level === '2') colour = 'darkolivegreen3';
  if (level === '3') colour = 'darkorchid1';
  if (level === '4') colour = 'deeppink';
  if (level === '5') colour = 'greenyellow';
  if (level === '6') colour = 'lightcoral';
  if (level === '7') colour = 'pink';
  if (level === '8') colour = 'wheat1';
  if (level === '9') colour = 'gold';
  return colour;
}

/**
 * Determines if there is an edge between two nodes
 * @param {Node} node1
 * @param {Node} node2
 * @param {Digraph} g
 * @returns True if there is an edge between node1 and node2
 */
export function nodesConnected(node1, node2, g) {
  for (let i = 0; i < g.edges.length; i += 1) {
    const nodeOne = g.edges[i].nodeOne.id;
    const nodeTwo = g.edges[i].nodeTwo.id;

    if ((nodeOne.localeCompare(node1) === 0 && nodeTwo.localeCompare(node2) === 0)
      || (nodeTwo.localeCompare(node1) === 0 && nodeOne.localeCompare(node2) === 0)) {
      return true; // if true, return yes
    }
  }
  return false;
}


/**
 * Link prerequisites courses together
 * @param {Object} g - graph
 * @param {Array} courses - all the courses for one subject/major
 */
function processLink(g,courses) {
  // For one course's pre-requisites, it may contain many of them
  // e.g: All of ECON 101, ECON 102
  // There for, we need a double for loop to go through each course in the array, and if
  // it is the pre-requisites course, add an edge to it.
  courses.forEach((course) => { // first loop, loop through each course and find it's pre-requisites
    courses.forEach((course2) => {
      if (course.CoursePrerequisite.length !== 0) { // make sure it has a pre-requisites
        if (course.CoursePrerequisite.includes(course2.CourseCode)) {
          if (!nodesConnected(course.CourseCode,course2.CourseCode,g)) {
            g.addEdge(course2.CourseCode, course.CourseCode);
          }

        }
      }
    });
  });
}

/**
 * This function will create graphs for all the subjects in UBC
 * @param {JSON} courses - the JSON object that contains all the UBC courses' info
 */
export function makegraphUBCSubjects(courses) {
  let subject = courses[0].CourseCode.split(' ')[0];//find the subject code for the first course
  let counter = 1;
  let g = graphviz.digraph('G');
  let coursesForSubject = [];

  /* Loop through each course*/
  courses.forEach((course) => {
    const nodeColour = colourPicker(course.CourseCode.trim()); // pick a color based on course name
    let tempSub = course.CourseCode.split(' ')[0];

    /* Compare the tempSub name with the subject name, if it's different, then it means we have a new subject*/
    if (tempSub.localeCompare(subject) !== 0) {
      /* link the pre-requisites and save the graph */
      processLink(g,coursesForSubject);
      g.set('label', `${subject}\n\n`);
      g.set('labelloc', 't');
      g.set('fontsize', '28');
      g.set('fontname', 'Times-Roman bold');
      g.setGraphVizPath('./');
      g.output('pdf', `./graphs/subjects/graph${counter}.pdf`);

      /* Reset the variables, and create a new graph*/
      counter += 1;
      subject = tempSub;
      g = graphviz.digraph('G');
      coursesForSubject = [];
    }

    // For some course code, it contains the course name as well
    // e.g: PHYS 106(3) Enriched Physics
    if (course.CourseCode.includes('(')) {
      course.CourseCode = course.CourseCode.split('(')[0].trim();
    } else {
      course.CourseCode = course.CourseCode.split(' ').slice(0,2).join(' ').trim();
    }
    g.addNode(course.CourseCode, { shape: 'box', style: 'filled', color: nodeColour });
    coursesForSubject.push(course);
  });
}

/**
 * This function will create graphs for all the programs(majors) in UBC
 * @param {JSON} programs - the JSON object that contains all the programs' info
 * @param {JSON} courses - the JSON object that contains all the UBC courses' info
 */
export function makegraphProgramUBC(programs,courses) {
  //This counter will count the number of pdf files
  let counter = 0;

  /* Loop through each program and generate a graph for it */
  programs.forEach((program) => {
    counter += 1;

    const g = graphviz.digraph('G');
    let degree = program.degreeName;

    if (degree === null) {
      degree = 'Program';
    }

    const graphTitle = `${degree}: ${program.programName}`;
    let coursesForMajor = [];//This array will store all the courses for this program

    program.majorInformation.courses.forEach((course) => {
      const nodeColour = colourPicker(course);
      const courseInfo = searchCourseByName(courses,course.trim()); // using the course name to find it's information

      if (courseInfo !== null) {
        g.addNode(courseInfo.CourseCode, { shape: 'box', style: 'filled', color: nodeColour });
        coursesForMajor.push(courseInfo);
      }
    });
    if (coursesForMajor.length !== 0) {
      processLink(g,coursesForMajor);
      g.set('label', `${graphTitle}\n\n`);
      g.set('labelloc', 't');
      g.set('fontsize', '40');
      g.set('fontname', 'Times-Roman bold');
      g.setGraphVizPath('./');
      g.output('pdf', `./graphs/majors/graph${counter}.pdf`);
    }
  });
}

/**
 * Merges the pdfs in temp to a single multi-page pdf, then deletes the files in temp
 * @param {String} - type can be "majors" or "subjects"
 */
export async function mergeGraphs(type) {
  const pdfDoc = await PDFDocument.create();

  fs.readdir(`./graphs/${type}/`, async (err, files) => {
    const length = await files.length;
    // files.forEach(async (filename) => {
    for (let i = 0; i < length; i += 1) {
      const filename = files[i];
      if ((filename.substring(filename.length - 4, filename.length) === '.pdf') || filename === `UBC${type}.pdf`) {
        //console.log(`Loading ${filename}`);
        const file = fs.readFileSync(`./graphs/${type}/${filename}`);
        let pdf;
        try {
          // eslint-disable-next-line no-await-in-loop
          pdf = await PDFDocument.load(file);
        } catch (e) {
          console.log('File not yet created. Trying again');
          // eslint-disable-next-line no-await-in-loop
          await sleep(1000);
          mergeGraphs();
          return;
        }
        // eslint-disable-next-line no-await-in-loop
        const copiedPages = await pdfDoc.copyPages(pdf, [0]);
        copiedPages.forEach((p) => {
          pdfDoc.addPage(p);
        });
      }
    }
    const mergedFile = await pdfDoc.save();
    fs.writeFileSync(`./graphs/UBC${type}.pdf`, mergedFile);
    for (let i = 0; i < length; i += 1) {
      const file = files[i];
      fs.unlink(`./graphs/${type}/${file}`, ((error) => {
        if (error) {
          console.log(error);
        }
      }));
    }
  });
}
