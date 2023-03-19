const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');
const { context } = require('@actions/github');
const octokit = github.getOctokit(core.getInput('github_token'));
const { dbDetailsFactory } = require('@metis-data/db-details');
const { pull_request, issue } = context.payload;
const parse = require('pg-connection-string').parse;

const getDbdetails = async (dbConnection) => {
  const dbDetails = dbDetailsFactory('postgres');
  const db = dbDetails.getDbDetails(dbConnection);
  console.log(db);
  return await db;
};

const sendDbdetails = async (dbConnection, apiKey, url) => {
  const data = await getDbdetails(dbConnection);
  console.log(data);
  axiosPost(
    url,
    {
      pmcDevice: {
        rdbms: 'postgres',
        db_name: dbConnection.database,
        db_host: dbConnection.host,
        dbPort: /*port || */ "5432",
      },
      data: data,
    },
    { 'x-api-key': apiKey }
  );
};

const createPmcDevice = async (dbConnection, apiKey, url) => {
  axiosPost(
    url,
    {
      rdbms: 'postgres',
      db_name: dbConnection.database,
      db_host: dbConnection.host,
      port: "5432",
    },
    { 'x-api-key': apiKey }
  );
};

const axiosPost = async (url, body, headers) => {
  try {
    await axios.post(url, body, { headers: headers });
  } catch (error) {
    console.log(error);
  }
};
//
// const commentPr = async (testName) => {
//   try {
//     const urlPrefix = core.getInput('target_url');
//     const apiKey = core.getInput('metis_api_key');
//     await octokit.rest.issues.createComment({
//       ...context.repo,
//       issue_number: pull_request ? pull_request.number : issue ? issue.number : 0,
//       body: `Metis just analyzed the SQL commands generated by the test. View the results in the link: ${encodeURI(`${urlPrefix}/projects/${apiKey}/test/${testName}`)}`,
//     });
//   } catch (error) {
//     console.error(error);
//     core.setFailed(error);
//   }
// };

// const createNewTest = async (testName, prId, prUrl) => {
//   try {
//     const urlPrefix = core.getInput('target_url');
//     const apiKey = core.getInput('metis_api_key');
//     await axios.post(
//       `${urlPrefix}/api/tests/create`,
//       {
//         prName: testName,
//         prId,
//         prUrl,
//         apiKey,
//       },
//       {
//         headers: {
//           'x-api-key': apiKey,
//         },
//       }
//     );
//   } catch (error) {
//     core.setFailed(error);
//   }
// };

async function main() {
  try {
    // Send Db details to backend.

    //Parse connection string
    let config = parse(core.getInput('db_connection_string'));

    //Populate the connection object

    //Todo: need to add support with custom port
    const dbConnection = {
      database: config.database,
      user: config.user,
      password: config.password,
      host: config.host,
      /*
          Maybe will cause problem need to check:
          ssl, either a boolean or an object with properties
            rejectUnauthorized
            cert
            key
            ca
      */
      // ssl: config?.ssl || { rejectUnauthorized: false },
    };
    await createPmcDevice(dbConnection, core.getInput('metis_api_key'), `${core.getInput('target_url')}/api/pmc-device`);
    await sendDbdetails(dbConnection, core.getInput('metis_api_key'), `${core.getInput('target_url')}/api/db-details`);
    // Send Extensions To backend.
    // Send Database config.
    // Query statistics (slow query log)
    // table statistics
    // Index usage
    // const testName = pull_request?.title || context.sha;
    // const prId = `${pull_request?.number}`;
    // const prUrl = pull_request?.html_url;
    // core.setOutput('pr_tag', testName);
    // await createNewTest(testName, prId, prUrl);

    // if (pull_request?.title !== undefined) {
    //   await commentPr(testName);
    // }
  } catch (error) {
    console.error(error);
    core.setFailed(error);
  }
}

main();
