# libarsnova-js

ARSnova is a web-based Audience Response System which allows you to get instant
feedback from your students. It helps you to get a better understanding about
the learning progress of your students and to identify topics which might need
to be discussed in more detail.

libarsnova-js is a client library which implements the ARSnova API and handles
the communication (HTTP/REST and Socket.IO) with the
[backend](https://github.com/thm-projects/arsnova-backend).

Currently libarsnova-js supports:

* retrieving and caching of skill questions and their answers as well as
  student's questions
* deleting free text answers and student's questions
* creating/updating sessions and skill questions
* event handling for live data (user count, pace feedback, student's questions
  and anwers)

libarsnova-js is [Open Source](COPYING) software. If you are a developer,
interested in didactics and want to help us making it even better, you might
also want to take a look at the [information for contributors](https://github.com/thm-projects/arsnova-presenter/blob/master/CONTRIBUTING.md).

## License

LGPLv3 or later, see [COPYING](COPYING) file
