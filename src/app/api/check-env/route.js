export async function GET() {
  return Response.json({
    env_vars: {
      DB_HOST: process.env.DB_HOST,
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD ? `${process.env.DB_PASSWORD.substring(0, 5)}...` : 'NOT_SET',
      DB_NAME: process.env.DB_NAME,
      DB_PORT: process.env.DB_PORT,
      NODE_ENV: process.env.NODE_ENV,
    }
  });
}
