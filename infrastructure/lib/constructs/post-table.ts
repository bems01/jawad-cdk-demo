import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import {
  aws_dynamodb as dynamodb,
  aws_iam as iam,
  aws_lambda as lambda,
} from "aws-cdk-lib";

// Extend the cdk.StackProps with custom properties for the GameTable
interface PostTableProps extends cdk.StackProps {
  partitionKey: string;
  /**
   * [Optional] Default: dynamodb.AttributeType.STRING
   */
  partitionKeyType?: dynamodb.AttributeType;
  /**
   * [Optional] Default: undefined
   */
  sortKey?: string;
  /**
   * [Optional] Default: dynamodb.AttributeType.STRING
   */
  sortKeyType?: dynamodb.AttributeType;
}

class PostTable extends Construct {
  public table: dynamodb.TableV2;

  public deletePolicy: iam.Policy;
  public getPolicy: iam.Policy;
  public putPolicy: iam.Policy;
  public scanPolicy: iam.Policy;
  public queryPolicy: iam.Policy;

  public deletePolicyStatement: iam.PolicyStatement;
  public getPolicStatement: iam.PolicyStatement;
  public putPolicyStatement: iam.PolicyStatement;
  public scanPolicyStatement: iam.PolicyStatement;
  public queryPolicyStatement: iam.PolicyStatement;

  public deleteRole: iam.Role;
  public getRole: iam.Role;
  public putRole: iam.Role;
  public scanRole: iam.Role;
  public queryRole: iam.Role;

  constructor(scope: Construct, id: string, props: PostTableProps) {
    super(scope, id);

    let tableProperties: dynamodb.TablePropsV2 = {
      tableName: `${id}Table`,
      partitionKey: {
        name: props.partitionKey,
        type: props.partitionKeyType || dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billing: dynamodb.Billing.onDemand(),
    };

    if (props.sortKey) {
      tableProperties = {
        ...tableProperties,
        sortKey: {
          name: props.sortKey,
          type: props.sortKeyType || dynamodb.AttributeType.STRING,
        },
      };
    }

    // Create a new DynamoDB Table
    this.table = new dynamodb.TableV2(this, `${id}Table`, tableProperties);

    // Create access policies and roles
    this.deletePolicyStatement = new iam.PolicyStatement({
      actions: ["dynamodb:DeleteItem"],
      effect: iam.Effect.ALLOW,
      resources: [this.table.tableArn],
    });
    this.deletePolicy = new iam.Policy(this, "deletePolicy", {
      statements: [this.deletePolicyStatement],
    });

    this.getPolicStatement = new iam.PolicyStatement({
      actions: ["dynamodb:GetItem"],
      effect: iam.Effect.ALLOW,
      resources: [this.table.tableArn],
    });
    this.getPolicy = new iam.Policy(this, "getPolicy", {
      statements: [this.getPolicStatement],
    });

    this.putPolicyStatement = new iam.PolicyStatement({
      actions: ["dynamodb:PutItem"],
      effect: iam.Effect.ALLOW,
      resources: [this.table.tableArn],
    });
    this.putPolicy = new iam.Policy(this, "putPolicy", {
      statements: [this.putPolicyStatement],
    });

    this.scanPolicyStatement = new iam.PolicyStatement({
      actions: ["dynamodb:Scan"],
      effect: iam.Effect.ALLOW,
      resources: [this.table.tableArn],
    });
    this.scanPolicy = new iam.Policy(this, "scanPolicy", {
      statements: [this.scanPolicyStatement],
    });

    this.queryPolicyStatement = new iam.PolicyStatement({
      actions: ["dynamodb:Query"],
      effect: iam.Effect.ALLOW,
      resources: [this.table.tableArn],
    });
    this.queryPolicy = new iam.Policy(this, "queryPolicy", {
      statements: [this.queryPolicyStatement],
    });

    this.getRole = new iam.Role(this, "getRole", {
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
    });
    this.getRole.attachInlinePolicy(this.getPolicy);

    this.putRole = new iam.Role(this, "putRole", {
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
    });
    this.putRole.attachInlinePolicy(this.putPolicy);

    this.scanRole = new iam.Role(this, "scanRole", {
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
    });
    this.scanRole.attachInlinePolicy(this.scanPolicy);

    this.queryRole = new iam.Role(this, "queryRole", {
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
    });
    this.queryRole.attachInlinePolicy(this.queryPolicy);
  }
}

export { PostTable as GameTable, PostTableProps };
