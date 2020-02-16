import getSaltFromEmail from '../../utils/getSaltFromEmail';

const loginSalt = async (parent, { email }) => {
  email = email.toLowerCase();

  const salt = await getSaltFromEmail(email);

  return { salt };
};

export default loginSalt;
