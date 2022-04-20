async function getPrerequisites(string) {
  let inBrackets = 0;

  const output = [];
  let builtString = '';

  // Loop through the word
  for (let i = 0; i < string.length; i += 1) {
    // Check if you are still within brackets
    if (string[i] === '(') {
      inBrackets += 1;
    }

    if (string[i] === ')') {
      inBrackets -= 1;
    }

    // If i is a comma that is not inside brackets push the current built string
    if (string[i] === ',' && inBrackets === 0) {
      output.push(builtString);
      builtString = '';
      i += 1;
    } else {
      builtString += string[i];

      // If i is the last character push the current built string
      if (i === (string.length - 1)) {
        output.push(builtString);
      }
    }
  }

  return output;
}

export default getPrerequisites;
