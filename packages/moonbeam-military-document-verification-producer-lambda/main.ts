exports.handler = async (event) => {
    for (const field in event) {
        if (event.hasOwnProperty(field)) {
          console.log(`Field: ${field}`);
          console.log(`Value: ${event[field]}`);
        }
    }
}