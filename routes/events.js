"use strict";

const express = require('express');
const eventRoutes  = express.Router({mergeParams: true});
const randomURL = require('../public/scripts/urls.js');
const bodyParser = require("body-parser");

const session     = require('cookie-session');


eventRoutes.use(session({
  name: 'session',
  keys: ["TEST1", "TEST2"],
}));

module.exports = (knex) => {

  eventRoutes.post("/", (req, res) => {
    req.session.temp = req.body.email;
    knex('users').select('email').where('email', req.body.email)
    .then((result) => {
      if(result.length) {
        res.send();
      } else {
        knex('users').insert({
          name: req.body.name,
          email: req.body.email,
          rank_id: 1
        }).then(() => {
          res.send();
        });
      }
    });
  });

  eventRoutes.get("/:id/edit", (req, res) => {
    req.session.temp = req.params.id;
    knex.raw(`SELECT * FROM events
        WHERE events.main_url = '${req.session.temp}'
      `)
      .then((result) => {
        res.render('event', { data: result.rows } );
      });

    //IF COMING FROM A SHORTURL...
      // knex.raw(`SELECT * FROM proposed_dates
      //   JOIN events ON events.id = proposed_dates.event_id
      //   WHERE events.main_url = '${req.session.temp}'
      // `)
      // .then((result) => {
      //   let rows = result.rows;
      //   let startTime = 'proposed_start_time';
      //   let endTime = 'proposed_end_time';
      //   let sortedByDate = rows.sort((a, b) => {
      //     return (a.date.slice(9, 10) - b.date.slice(9, 10));
      //   });
      //   let secondSortByTime = sortedByDate.sort((a, b) => {
      //     return (a[startTime].slice(0, 5) - b[endTime].slice(0, 5));
      //   });
      //   res.render('event', { data: result.rows } );
      // });
  });

// store event data and any proposed date data
  eventRoutes.post("/:id/edit", (req, res) => {
    let date = req.body.slotdate;
    let startTime = req.body.slothr;
    let endTime = req.body.slothr2;
    let mainUrl = req.session.temp;
    knex('events').select('id').where('main_url', mainUrl)
    .then((result) => {
      return knex('proposed_dates').insert({
        proposed_start_time: startTime,
        proposed_end_time: endTime,
        date: date,
        event_id: result[0].id,
      }).catch((err) => {
        res.json(err);
      });
    });
  });
  // delete the event
  eventRoutes.post("/:id/delete", (req, res) => {
    knex.raw(`DELETE FROM events
              WHERE main_url = '${req.params.id}'`)
    .then(() => {
      res.redirect('/');
    });
  });

  eventRoutes.get("/:id", (req, res) => {
    knex.raw(`SELECT * FROM proposed_dates
      JOIN events ON events.id = proposed_dates.event_id
      WHERE events.main_url = '${req.params.id}'
    `).then((result) => {
      res.render('event_user', { data: result.rows } );
    });
  });

  eventRoutes.post("/create", (req, res) => {
    let eventUrl = randomURL();
    knex('events').insert({
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      img_src: req.body.img,
      location: req.body.location,
      detail: req.body.details,
      name: req.body.eventName,
      categories_id: req.body.category,
      main_url: eventUrl
    })
    .then(() => {
      return Promise.all([
        knex('events').select('id').where('main_url', eventUrl),
        knex('users').select('id').where('email', req.session.temp),
      ]);
    })

    .then((multiresult) => {
      let event_id = multiresult[0][0].id;
      let user_id = multiresult[1][0].id;
      let userUrl = randomURL();
      return knex('events_users').insert({
        event_id: event_id,
        user_id: user_id,
        short_url: userUrl,
      });
    })
    .then(() => {
      res.send({eventUrl: eventUrl});
    }).catch((err) => {
      res.send({error: err});
    });
  });

// eventRoutes.post("/events/:id/edit/delete", (req, res) => {
//    let variable of timslots start = x
//    let variable of timeslots end = x
//    knex('proposed_dates')
//    .where({
//      proposed_start_time: x,
//      proposed_end_time: y
//    })
//    .del()
//  })

  return eventRoutes;
};

