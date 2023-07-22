// const axios = require("axios");

// exports.getVideos = async (req, res) => {
//   const CHANNEL_ID = "UCetQjHCqSAqlPxY8VJVpnOg"; // Replace with the desired channel ID

//   const API_KEY = "AIzaSyDkTYtVt6IASK_wg71A3gF1cpdMJrLrwjg"; // Replace with your YouTube API key

//   const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=50`;

//   try {
//     const response = await axios.get(url);
//     const videoData = response.data.items;
//     res.status(200).json({ videoData });
//   } catch (error) {
//     res
//       .status(error.response?.status || 500)
//       .json(error.response?.data || "Something went wrong");
//   }
// };
const axios = require("axios");

exports.getVideos = async (req, res) => {
  const CHANNEL_ID = "UCetQjHCqSAqlPxY8VJVpnOg"; // Replace with the desired channel ID
  const API_KEY = "AIzaSyDsZgNK6bxs4BVg7j2iNRHMCcbC04FaF4I"; // Replace with your YouTube API key
  const pageToken = req.query.pageToken || ""; // Get the pageToken from the query params

  const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=50&pageToken=${pageToken}`;

  try {
    const response = await axios.get(url);
    const videoData = response.data.items;
    const nextPageToken = response.data.nextPageToken; // Get the nextPageToken from the response
    res.status(200).json({ videoData, nextPageToken });
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || "Something went wrong");
  }
};
