var RATEMYPROFESSOR_SEARCH_URL = 'http://www.ratemyprofessors.com/search.jsp';
var RATEMYPROFESSOR_PROF_URL = 'http://www.ratemyprofessors.com/ShowRatings.jsp?tid=';

var request = require('request');
var cheerio = require('cheerio');
var deasync = require('deasync');
var async = require('async');

function getList() {
  return [
    { _id: null, rmp_id: null, name: "Phuong Nguyen", rating: null },
    { _id: null, rmp_id: null, name: "Bo Fu", rating: null },
    { _id: null, rmp_id: null, name: "Hubert Huynth", rating: null },
    { _id: null, rmp_id: null, name: "Ramin Moazzeni", rating: null }
  ];
}

function getRMPId(prof) {
  var query_params = {
    queryoption: 'HEADER',
    queryBy: 'teacherName',
    schoolName: 'California State University Long Beach',
    schoolID: '',
    query: prof.name
  }, id;

  request({ url: RATEMYPROFESSOR_SEARCH_URL, qs: query_params }, function(err, response, body) {
    if (err) {
      console.log(err);
    } else if (response.statusCode !== 200) {
      console.log('Status code : ' + response.statusCode + ' while processing ' + prof.name + '\nAborting');
    }

    try {
      id = /\d+$/.exec(cheerio.load(body)('li.listing.PROFESSOR > a:first-child')[0].attribs.href)[0];
      return;
    } catch (e) {
      console.log('No professor with name : ' + prof.name);
    }
    id = -1;
  });

  deasync.loopWhile(function() { return !id });
  return id;
}

function getRating(prof) {
  var grade;

  request({ url: RATEMYPROFESSOR_PROF_URL + prof.rmp_id}, function(err, response, body) {
    if (err) {
      console.log(err);
    } else if (response.statusCode !== 200) {
      console.log('Status code : ' + response.statusCode + '\nAborting');
    } else {
      grade = cheerio.load(body)('div.grade')[0].children[0].data;
      return;
    }

    grade = -1;
  });

  deasync.loopWhile(function() { return !grade });
  return grade;
}

function updateProf(prof) {
  console.log('Connect to DB and update ' + prof.name + ' (' + prof.rating + ')');
}

function processProf(prof) {
  if (!prof.rmp_id)
    if ((prof.rmp_id = getRMPId(prof)) === -1)
      return;
  if ((prof.rating = getRating(prof)) !== -1)
    updateProf(prof);
}

(function() {
  var profs = getList();

  async.each(profs, processProf, function(err) {
    console.log(err);
  });
})();
