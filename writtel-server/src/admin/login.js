import React, {useState} from 'react';
import {Buffer} from 'buffer';
import {scrypt} from 'scrypt-js';
import {useLocation} from 'react-router-dom';
import queryString from 'query-string';

import {useSite} from '../site';
import {useApolloClient} from '../apollo';

import * as queries from '../queries';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const client = useApolloClient();
  const location = useLocation();

  const login = async (email, password) => {
    const {data} = await client.mutate({
      mutation: queries.login,
      variables: {
        email,
        password
      }
    });

    if (data.login.success) {
      document.cookie = `token=${data.login.token};path=/`;
      if (location.state && location.state.from) {
        window.location = location.state.from.pathname + location.state.from.search + location.state.from.hash;
      } else {
        const query = queryString.parse(window.location.search);
        window.location = query.from;
      }
    }
  };

  const onClickLogin = async () => {
    const {data} = await client.query({
      query: queries.getLoginSalt,
      variables: {
        email
      }
    });

    const salt = Buffer.from(data.loginSalt.salt, 'base64');
    const pass = Buffer.from(password.normalize('NFKC'));
    const N = 1024, r = 8, p = 1;
    const dkLen = 32;

    const key = Buffer.from(await scrypt(pass, salt, N, r, p, dkLen)).toString('base64');
    await login(email, key);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Enter email address"
        value={email}
        onChange={event => setEmail(event.target.value)}
      />
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={event => setPassword(event.target.value)}
      />
      <button onClick={onClickLogin}>Sign In</button>
    </div>
  );
};

Login.templateOptions = () => ({
  title: 'Login Page',
  head: () => {
    const site = useSite();

    return (
      <>
        <title>Sign In | {site.title}</title>
      </>
    );
  }
});

export default Login;
