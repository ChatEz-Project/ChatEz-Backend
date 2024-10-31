const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

const dotenv = require("dotenv");
const environment = process.env.NODE_ENV || 'dev';
dotenv.config({ path: `.env.${environment}` });

async function accessSecret(name) {
  const [accessResponse] = await client.accessSecretVersion({
    name: `projects/${process.env.PROJECT_ID}/secrets/${name}/versions/latest`,
  });

  return accessResponse.payload.data.toString('utf8');
}

module.exports = accessSecret;
