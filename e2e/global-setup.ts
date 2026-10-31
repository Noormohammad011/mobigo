const sweep = async () => {
  const secret = process.env.E2E_SUPABASE_SECRET_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!secret || !url) return
  let page = 1
  for (;;) {
    const response = await fetch(`${url}/auth/v1/admin/users?page=${page}&per_page=200`, {
      headers: { apikey: secret, authorization: `Bearer ${secret}` },
    })
    if (!response.ok) return
    const body = (await response.json()) as { users?: { id: string; email?: string }[] }
    const users = body.users ?? []
    for (const user of users) {
      if (!user.email?.endsWith("@e2e.mobigo.test")) continue
      await fetch(`${url}/auth/v1/admin/users/${user.id}`, {
        method: "DELETE",
        headers: { apikey: secret, authorization: `Bearer ${secret}` },
      })
    }
    if (users.length < 200) return
    page += 1
  }
}

export default sweep
