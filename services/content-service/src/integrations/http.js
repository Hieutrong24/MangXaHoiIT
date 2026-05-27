function startHttpServer({ app, port }) {
  const server = app.listen(port, () => {
    console.log(`[http] server running on port ${port}`);
  });

  return {
    server,
    async stop() {
      return new Promise((resolve) => {
        server.close(() => {
          console.log("[http] server stopped");
          resolve();
        });
      });
    },
  };
}

module.exports = { startHttpServer };