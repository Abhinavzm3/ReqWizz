


const HandleGoogleLogin = () => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

  const options = {
    redirect_uri: 'http://localhost:5000/api/user/auth/google/callback',
    client_id: '437612887978-nuqckrtdi6qk4n4upsn61oqn09t8638o.apps.googleusercontent.com',
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'profile',
      'email'
    ].join(' '),
  };

  const qs = new URLSearchParams(options);
  window.location.href = `${rootUrl}?${qs.toString()}`;
};




export default HandleGoogleLogin