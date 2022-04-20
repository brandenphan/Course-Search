// my-awesome-reporter.ts
import { Reporter } from '@playwright/test/reporter';
import axios from "axios";

class MyReporter implements Reporter {
  failedTests: any[];

  constructor() {
    this.failedTests = [];
  }

  // function that is called before any tests are executed
  onBegin(config, suite) {
    console.log(`Starting the run with ${suite.allTests().length} tests`);
  }

  // function that is called after each test is executed
  onTestEnd(test, result) {
    if (result.status === 'failed') {
      this.failedTests.push({
        title: test.title,
        location: test.location,
      });
    }
  }

  // function that is called after all tests are executed
  async onEnd(result) {
    if (result.status === 'failed') {
      try {
        await axios.post('http://131.104.49.107/api/email', {
          data: this.failedTests,
        });
      } catch (err) {
        console.error(err);
      }
    }

    console.log(`Finished the run: ${result.status}`);
  }
}

export default MyReporter;
