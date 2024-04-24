import { exec } from "child_process";
import { argv } from "process";
import replace from "replace-in-file";

exec(
  "aws cloudformation describe-stacks --region us-east-1 --query 'Stacks[?StackName==`web-backend`][].Outputs[?OutputKey==`apiURL`].OutputValue' --output text",
  (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(stdout);

    let environmentFile;
    if (argv.some((arg) => arg === "-prod")) {
      environmentFile = "environment.ts";
    } else {
      environmentFile = "environment.development.ts";
    }

    const options = {
      files: `../web-ng/src/environments/${environmentFile}`,
      from: /apiUrl: ['"].*['"]/g,
      to: `apiUrl: '${stdout.trim()}'`,
    };
    const results = replace(options)
      .then((results) => {
        console.log("Replacement results:", results);
      })
      .catch((error) => {
        console.error("Error occurred:", error);
      });
  }
);
