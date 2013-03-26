var fmt = require('fmt');
var awssum = require('awssum');
var amazon = awssum.load('amazon/amazon');
var S3 = awssum.load('amazon/s3').S3;

var env             = process.env;
var accessKeyId     = env.ACCESS_KEY_ID;
var secretAccessKey = env.SECRET_ACCESS_KEY;
var awsAccountId    = env.AWS_ACCOUNT_ID;

var s3 = new S3({
    'accessKeyId' : accessKeyId,
    'secretAccessKey' : secretAccessKey,
    'region' : amazon.US_EAST_1
});

fmt.field('Region', s3.region() );
fmt.field('EndPoint', s3.host() );
fmt.field('AccessKeyId', s3.accessKeyId().substr(0, 3) + '...' );
fmt.field('SecretAccessKey', s3.secretAccessKey().substr(0, 3) + '...' );
fmt.field('AwsAccountId', s3.awsAccountId() );

var optionsNotFound = {
    BucketName    : 'pie-18',
    ObjectName    : 'not-found.txt',
    Acl           : 'private',
};

s3.PutObjectAcl(optionsNotFound, function(err, data) {
    fmt.msg("putting an object acl to pie-18 - expecting failure (object not found)");
    fmt.dump(err, 'Error');
    fmt.dump(data, 'Data');
});

var optionsFound = {
    BucketName    : 'pie-18',
    ObjectName    : 'test-object.txt',
    Acl           : 'private',
};

s3.PutObjectAcl(optionsFound, function(err, data) {
    fmt.msg("putting an object acl to pie-18 - expecting success");
    fmt.dump(err, 'Error');
    fmt.dump(data, 'Data');
});

var fullControlReadAll = {
    BucketName : 'pie-18',
    ObjectName : 'test-object-for-complex-acl.txt',
    AccessControlPolicy: {
        AccessControlList: {
            Grant: [
                {
                    Permission: 'FULL_CONTROL',
                    Grantee: {
                        EmailAddress : 'admin@appsattic.com',
                        _attr : {
                            'xsi:type' : 'AmazonCustomerByEmail',
                            'xmlns:xsi' : 'http://www.w3.org/2001/XMLSchema-instance',
                        },
                    },
                },
                {
                    Permission: 'FULL_CONTROL',
                    Grantee: {
                        // still me
                        ID : 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                        _attr : {
                            'xsi:type' : 'CanonicalUser',
                            'xmlns:xsi' : 'http://www.w3.org/2001/XMLSchema-instance',
                        },
                    },
                },
                {
                    Permission: 'READ',
                    Grantee: {
                        URI : 'http://acs.amazonaws.com/groups/global/AllUsers',
                        _attr : {
                            'xsi:type' : 'Group',
                            'xmlns:xsi' : 'http://www.w3.org/2001/XMLSchema-instance',
                        },
                    },
                },
            ],
        },
        Owner: {
            ID: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        }
    }
};

s3.PutObjectAcl(fullControlReadAll, function(err, data) {
    fmt.msg("putting an object acl with a large AccessControlPolicy to pie-18 - expecting success");
    fmt.dump(err, 'Error');
    fmt.dump(data, 'Data');
});
