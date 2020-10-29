const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const secrets = require("./secrets.js");
const SpotifyWebApi = require("spotify-web-api-node");

var spotifyApi = new SpotifyWebApi({
  clientId: secrets.clientId,
  clientSecret: secrets.clientSecret,
});

async function setCredentials() {
  const data = await spotifyApi.clientCredentialsGrant();
  await spotifyApi.setAccessToken(data.body["access_token"]);
  // gets secrets and makes a request to Spotify to get an access token; needed for all spotify API requests
}

async function getArtistId(artistName) {
  const data = await spotifyApi.searchArtists(artistName);
  // returns a list of artist ids that match the artist name param, in popularity order
  return data.body.artists.items[0].id;
}

async function getRelatedArtist(artistId) {
  const data = await spotifyApi.getArtistRelatedArtists(artistId);
  // returns a list of related artists
  let relatedArtists = [];
  let i = 0;
  while (i < data.body.artists.length) {
    const name = data.body.artists[i].name;
    relatedArtists.push({ recommendation: name });
    i++;
  }
  var randomArtist =
    relatedArtists[Math.floor(Math.random() * relatedArtists.length)];
  return randomArtist.recommendation;
  // takes list of recommended artists, puts them into an array of objects, then pulls one random artist from the list
}

async function getOrderedAlbums(artistId) {
  const data = await spotifyApi.getArtistAlbums(artistId);
  let albumNames = [];
  let i = 0;
  while (i < data.body.items.length) {
    const name = data.body.items[i].name;
    const releaseDate = data.body.items[i].release_date;
    const albumImage = data.body.items[i].images[0];
    const duplicate = albumNames.some((album) => album.album_name === name);
    // spotify's album data includes lots of duplicates, this removes exact matched duplicates
    if (!duplicate)
      albumNames.push({
        album_name: name,
        release_date: releaseDate,
        album_image: albumImage,
      });
    i++;
    // creates an array of objects, each object containing an album name, release date, and album image
  }

  function compare(a, b) {
    if (a.release_date < b.release_date) return 1;
    if (a.release_date > b.release_date) return -1;
    return 0;
  }
  albumNames.sort(compare);
  // compares the release dates of each album and returns the list of albums in reverse chronological order
  return albumNames[1];
}

async function main(artistName) {
  await setCredentials();
  let recArtist = await getRelatedArtist(await getArtistId(artistName));
  let recObject = await getOrderedAlbums(await getArtistId(recArtist));
  recObject.recommended_artist = recArtist;
  return recObject;
}

app.post("/", jsonParser, async function (req, res, next) {
  let result = await main(req.body.artistName);
  res.json(result);
});

app.listen(3000);
