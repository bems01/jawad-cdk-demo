#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { FrontendStack } from "../lib/frontend-stack";
import { BackendStack } from "../lib/backend-stack";

const BASE_STACK_PROPS: cdk.StackProps = {
  env: {
    account: process.env.AWS_ACCOUNT_ID,
    region: process.env.AWS_DEFAULT_REGION,
  },
};

const app = new cdk.App();

new BackendStack(app, "web-backend", BASE_STACK_PROPS);
new FrontendStack(app, "web-frontend", BASE_STACK_PROPS);
