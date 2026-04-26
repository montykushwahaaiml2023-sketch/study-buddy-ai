// Mongoose removed. DB connections are handled by Prisma via @/lib/prisma.
const connectDB = async () => {
  // No-op: Prisma manages its own connection pool
};

export default connectDB;
