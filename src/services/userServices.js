export const createUser = async (userData) => {
  console.log("Creating user with data:", userData);

  return {
    id: Date.now(),
    ...userData,
  };
};
