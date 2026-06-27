export type DemoUser = {
  id: string;
  email: string;
  password: string;
  name: string;
};

/** Demo credentials — replace with real auth / database later */
export const DEMO_USERS: DemoUser[] = [
  {
    id: "1",
    email: "admin@example.com",
    password: "admin123",
    name: "Demo Admin",
  },
];

export function validateCredentials(
  email: string,
  password: string,
): DemoUser | null {
  const normalized = email.trim().toLowerCase();
  const user = DEMO_USERS.find((u) => u.email.toLowerCase() === normalized);
  if (!user || user.password !== password) return null;
  return user;
}
