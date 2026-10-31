const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"])

/** Refuse any database that is not on this machine, or whose name does not end in _test or _e2e. */
export const assertLocalTestDatabase = (connectionString: string): void => {
  let url: URL
  try {
    url = new URL(connectionString)
  } catch {
    throw new Error(`Refusing database URL: it is not a valid URL. Host must be local and the name must end in _test or _e2e.`)
  }
  const host = decodeURIComponent(url.hostname).replace(/^\[|\]$/g, "")
  const name = decodeURIComponent(url.pathname.replace(/^\//, ""))
  if (!LOCAL_HOSTS.has(host) || (!name.endsWith("_test") && !name.endsWith("_e2e"))) {
    throw new Error(
      `Refusing database "${name}" on "${host}". Host must be local (localhost, 127.0.0.1, or ::1) and the name must end in _test or _e2e. Query strings are ignored.`
    )
  }
}
