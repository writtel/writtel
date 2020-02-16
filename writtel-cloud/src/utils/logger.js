
const logger = {
  serverWillStart() {
    process.stderr.write('Starting Apollo Server\n');
  },

  requestDidStart(requestContext) {
    if (/query IntrospectionQuery/.test(requestContext.request.query)) {
      return null;
    }

    process.stderr.write(`Query: ${requestContext.request.query}\n`);

    return {
      didEncounterErrors(requestContext) {
        process.stderr.write(`Error: ${requestContext.errors}\n`);
      },
    };
  },
};

export default logger;
