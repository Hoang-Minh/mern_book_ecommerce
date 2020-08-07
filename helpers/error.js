const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (error, req, res, next) => {
  // some other routes has an error and we make it here
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  console.log("errorHandler", error);
  res.json({
    error: error.error,
    stack: process.env.NODE_ENV === "production" ? "🤢" : error.stack,
  });
};

// For now, jsut comment this out. Need to figure out a way to handle error from database

// const uniqueMessage = (error) => {
//   let output;
//   try {
//     let fieldName = error.message.substring(
//       error.message.lastIndexOf(".$") + 2,
//       error.message.lastIndexOf("_1")
//     );
//     output =
//       fieldName.charAt(0).toUpperCase() +
//       fieldName.slice(1) +
//       " already exists";
//   } catch (ex) {
//     output = "Unique field already exists";
//   }

//   return output;
// };

// /**
//  * Get the erroror message from error object
//  */
// const dbErrorHandler = (error, req, res, next) => {
//   console.log("db Error Handler");
//   let message = "";

//   if (error.code) {
//     switch (error.code) {
//       case 11000:
//       case 11001:
//         message = uniqueMessage(error);
//         break;
//       default:
//         message = "Something went wrong";
//     }
//   } else {
//     for (let errorName in error.errorors) {
//       if (error.errorors[errorName].message) {
//         message = error.errorors[errorName].message;
//       }
//     }
//   }

//   return next({ error: message }); // check !!!
// };

module.exports = {
  notFound,
  errorHandler,
};
