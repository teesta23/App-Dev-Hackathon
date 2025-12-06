export async function updateLeetCodeStats(userId: string, lcUsername: string) {
  const response = await fetch("http://localhost:8000/leetcode/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: userId,
      lcUsername: lcUsername,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update LeetCode stats: ${response.status}`);
  }

  return await response.json();
}