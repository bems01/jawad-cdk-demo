import * as path from "path";
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfront_origins from "aws-cdk-lib/aws-cloudfront-origins";

export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id);

    const bucket = new s3.Bucket(this, "WebNgBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      "OriginAccessIdentity"
    );
    bucket.grantRead(originAccessIdentity);

    // CloudFront Distribution
    const distribution = new cloudfront.Distribution(
      this,
      "MyStaticWebsiteDistribution",
      {
        defaultBehavior: {
          origin: new cloudfront_origins.S3Origin(bucket, {
            originAccessIdentity,
          }),
        },
        defaultRootObject: "index.html",
      }
    );

    /**
     * Deploy the frontend to the bucket. The source is the output of the Angular build.
     * This is an L3 Construct that _should_ handle the deployment of the frontend to the bucket,
     * including versioning.
     */
    const s3Deployment = new s3deploy.BucketDeployment(
      this,
      "BucketDeployment",
      {
        destinationBucket: bucket,
        sources: [
          s3deploy.Source.asset(
            path.resolve(__dirname, "../../web-ng/dist/web-ng/browser")
          ),
        ],
      }
    );

    // Output the website URL
    new cdk.CfnOutput(this, "S3DeploymentBucketWebsiteURL", {
      value: s3Deployment.deployedBucket.bucketWebsiteUrl,
    });
    new cdk.CfnOutput(this, "CloudFrontWebsiteURL", {
      value: `https://${distribution.distributionDomainName}`,
    });
  }
}
