import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import {
  StackProps,
  aws_apigateway as apigateway,
  aws_lambda as lambda,
} from "aws-cdk-lib";
import { GameTable } from "./constructs/post-table";

const POSTS_TABLE = "Posts";

export class BackendStack extends cdk.Stack {
  private postTable: GameTable;
  private apiGateway: apigateway.RestApi;
  private methodOptions = {
    methodResponses: [
      { statusCode: "200" },
      { statusCode: "400" },
      { statusCode: "500" },
    ],
  };

  private errorResponses = [
    {
      selectionPattern: "400",
      statusCode: "400",
      responseTemplates: {
        "application/json": `{
          "error": "Bad input!"
        }`,
      },
    },
    {
      selectionPattern: "4\\d{2}",
      statusCode: "400",
      responseTemplates: {
        "application/json": `{
          "error": "Something Went Wrong!"
        }`,
      },
    },
    {
      selectionPattern: "5\\d{2}",
      statusCode: "500",
      responseTemplates: {
        "application/json": `{
            "error": "Internal Service Error!"
          }`,
      },
    },
  ];

  private integrationResponses = [
    {
      statusCode: "200",
    },
    ...this.errorResponses,
  ];

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id);

    this.createTables();
    this.createApiGateway();

    new cdk.CfnOutput(this, "apiURL", {
      value: this.apiGateway.url,
    });
  }

  private createTables() {
    this.postTable = new GameTable(this, POSTS_TABLE, {
      partitionKey: "postId",
      sortKey: "timestamp",
    });
  }

  private createApiGateway() {
    // Create the API Gateway
    this.apiGateway = new apigateway.RestApi(this, "PostsApi", {
      restApiName: "Post Service",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
      },
    });

    const lambdafunc = new lambda.Function(this, "CreatePostFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "create-post.handler",
      code: lambda.Code.fromAsset("lambda"),
      environment: {
        DYNAMO_DB_TABLE_NAME: this.postTable.table.tableName,
      },
    });
    lambdafunc.addToRolePolicy(this.postTable.putPolicyStatement);

    const createPostIntegration = new apigateway.LambdaIntegration(lambdafunc);

    const getPosts = new apigateway.AwsIntegration({
      action: "Scan",
      options: {
        credentialsRole: this.postTable.scanRole,
        integrationResponses: this.integrationResponses,
        requestTemplates: {
          "application/json": `{
                "TableName": "${this.postTable.table.tableName}"
              }`,
        },
      },
      service: "dynamodb",
    });

    const apiRoot = this.apiGateway.root.addResource("api");
    const post = apiRoot.addResource("post");
    post.addMethod("GET", getPosts, this.methodOptions);
    post.addMethod("POST", createPostIntegration, this.methodOptions);
  }
}
