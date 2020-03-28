const Dev = require("../models/Dev");
const parseStringAsArray = require("../utils/parseStringAsArray");
const gitHubApi = require("../utils/githubApi");
const { findConnections, sendMessage } = require("../webSocket");

module.exports = {
  async index(request, response) {
    const devs = await Dev.find();

    return response.json(devs);
  },
  async store(request, response) {
    const { github_username, techs, latitude, longitude } = request.body;

    let dev = await Dev.findOne({ github_username });

    if (!dev) {
      const apiResponse = await gitHubApi(github_username);

      let { name, avatar_url, bio } = apiResponse.data;

      if (!name) {
        name = apiResponse.data.login;
      }

      const techsArray = parseStringAsArray(techs);

      const location = {
        type: "Point",
        coordinates: [longitude, latitude]
      };

      dev = await Dev.create({
        github_username,
        name,
        avatar_url,
        bio,
        techs: techsArray,
        location
      });

      const sendSocketMessageTo = findConnections(
        { latitude, longitude },
        techsArray
      );
      sendMessage(sendSocketMessageTo, "newDev", dev);

      return response.json(dev);
    }

    return response.json("Dev already exists");
  },

  async update(request, response) {
    const { github_username } = request.query;
    const { techs, latitude, longitude } = request.body;

    const techsArray = parseStringAsArray(techs);

    const apiResponse = await gitHubApi(github_username);
    const { name = login, avatar_url, bio } = apiResponse.data;

    const location = {
      type: "Point",
      coordinates: [longitude, latitude]
    };

    const dev = await Dev.findOneAndUpdate(
      { github_username: github_username },
      {
        name,
        avatar_url,
        bio,
        techs: techsArray,
        location
      },
      { new: true }
    );

    return response.json(dev);
  },

  async destroy(request, response) {
    const { github_username } = request.query;
    let dev = await Dev.findOne({ github_username });

    if (!dev) return response.json("Dev doesn't exists");

    Dev.findOneAndDelete({ github_username: github_username }, function(e) {
      if (e) return response.json(e);
      return response.json(dev);
    });
  }
};
