export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Glam Rapido API",
    version: "0.1.0",
    description: "Salon marketplace API with JWT auth, RBAC-ready routes, bookings and salon discovery."
  },
  servers: [{ url: "http://localhost:4000/api" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: { "200": { description: "API status" } }
      }
    },
    "/auth/signup": {
      post: {
        summary: "Create a customer account",
        responses: { "201": { description: "Created user and tokens" } }
      }
    },
    "/auth/login": {
      post: {
        summary: "Login with email and password",
        responses: { "200": { description: "Authenticated user and tokens" } }
      }
    },
    "/auth/me": {
      get: {
        security: [{ bearerAuth: [] }],
        summary: "Get the current user",
        responses: { "200": { description: "Current user" } }
      }
    },
    "/salons": {
      get: {
        summary: "List salons",
        parameters: [
          { name: "q", in: "query", schema: { type: "string" } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "minRating", in: "query", schema: { type: "number" } }
        ],
        responses: { "200": { description: "Salon list" } }
      }
    },
    "/salons/search": {
      get: {
        summary: "Search salons by salon, service, stylist, city or address",
        parameters: [
          { name: "q", in: "query", schema: { type: "string" } },
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "minRating", in: "query", schema: { type: "number" } }
        ],
        responses: { "200": { description: "Matching salon list" } }
      }
    },
    "/salons/{slug}": {
      get: {
        summary: "Get salon details",
        parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Salon detail" } }
      }
    },
    "/bookings": {
      get: {
        security: [{ bearerAuth: [] }],
        summary: "List current user's bookings",
        responses: { "200": { description: "Booking list" } }
      },
      post: {
        security: [{ bearerAuth: [] }],
        summary: "Create a booking",
        responses: { "201": { description: "Created booking" } }
      }
    }
  }
};
