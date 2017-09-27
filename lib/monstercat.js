const fs = require('fs')
const path = require('path')

var request = require('request');
const FileCookieStore = require('tough-cookie-filestore');

const STATE_PATH = path.join(process.env.HOME, "/.mcat")
const COOKIE_JAR_PATH = STATE_PATH + "/session"

const MC_SERVER = "https://connect.monstercat.com"

// Monster Cat connect API uses cookies; persist these and other state.
var __StateStoreDidInit = false
const _initStateStore = ()=> {
  if (__StateStoreDidInit) return

  // Ensure state files exist
  fs.existsSync(STATE_PATH) || fs.mkdirSync(STATE_PATH)
  fs.existsSync(COOKIE_JAR_PATH) || fs.writeFileSync(COOKIE_JAR_PATH, "")

  // Use the FS jar by default
  const jar = request.jar(new FileCookieStore(COOKIE_JAR_PATH));
  request = request.defaults({ jar });
  __StateStoreDidInit = true
}

const mcRequest = (method, path, options, done)=> {
  _initStateStore()
  if (typeof options == "function") done = options
  options = options || {}
  options.method = method
  options.uri = MC_SERVER + path

  request(options, (err, res, body)=> {
    if (err) return done(err)
    if (Math.floor(res.statusCode/100) != 2) {
      return done(new Error(`MonsterCat: ${body.message} (${res.statusCode})`))
    }
    return done(err, res, body)
  });
}

module.exports = { request: mcRequest }
