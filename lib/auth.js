import { auth } from "@clerk/nextjs";

export const getAuth = () => {
  const { userId } = auth();
  return { userId };
};

export const withAuth = (handler) => {
  return async (req, ...args) => {
    const { userId } = auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }
    return handler(req, ...args);
  };
};
