const axios = require("axios");

module.exports = async function gitHubApi(githubUsername){
  const apiResponse = await axios.get(
    `https://api.github.com/users/${githubUsername}`
  );
  return apiResponse
}