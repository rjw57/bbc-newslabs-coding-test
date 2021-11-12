// Approximately locate an IP address via geolocation. To avoid leaking
// submitter IPs, this uses a local database.
//
// Note: in reality, one would use something like
// https://www.npmjs.com/package/geoip-lite which ships with an in-package
// database. For the purposes of this exercise the geo location randomly chooses
// "unknown" or Broadcasting House, London.
//
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const locateIP = (ip: string) => {
  return Math.random() < 0.8 ? "51.5188917,-0.1461194" : undefined;
};

export default locateIP;
