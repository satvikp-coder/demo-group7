export function validate(schema, source = "body") {
  if (!["body", "params", "query"].includes(source)) {
    throw new Error("Unsupported validation source");
  }
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return res.status(400).json({
        error: {
          message: "Invalid request",
          issues: result.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
      });
    }
    // Express 5 query properties are read-only; keep parsed input separately.
    req.validated = { ...req.validated, [source]: result.data };
    return next();
  };
}
