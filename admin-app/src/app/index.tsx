import { Redirect } from 'expo-router';

// Root index — immediately redirect to login.
// The _layout.tsx auth guard will redirect to /(tabs) if already logged in.
export default function Index() {
  return <Redirect href="/login" />;
}
