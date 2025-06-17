export function useGoogleAuth() {
  const loginWithGoogle = () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    window.location.href = `${backendUrl}/oauth2/authorization/google`;
  };

  return { loginWithGoogle };
}
