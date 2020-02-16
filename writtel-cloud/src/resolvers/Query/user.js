
const user = async (_, params, context) => {
  if (!context.user) {
    return null;
  }

  const user = { ...context.user };

  return user;
};

export default user;
