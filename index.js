const Promise = require('bluebird')
const fs      = require('fs')

Promise.promisifyAll(fs)

let hasConfigFile = false
fs.readFileAsync('input.json')
.then(JSON.parse)
.then(function (contents) {
  hasConfigFile = true
  if (contents.alias.length == 0) {
    return Promise.reject('Empty alias, edit the config file first!')
  }
  if (contents.key.length == 0) {
    return Promise.reject('Empty key-name, edit the config file first!')
  }

  // Create the bind command which executes the aliases (example: bind "x" "aliasname")
  let response = "bind \"".concat(contents.key, "\" \"", contents.alias, "\"\n")

  // Create the first alias (example: alias "key" "aliasname")
  response += "alias \"".concat(contents.alias, "\" \"", contents.alias, "0\"\n")

  for (let i = 0; i < contents.data.length; i++) {
    // Create the alias query based on the current count + data
    let x = "alias \"".concat(contents.alias, i.toString(), "\" \"say ", contents.data[i], "; alias ", contents.alias, " ", contents.alias)
    
    // If the current index is the last one, execute the first alias (0) again
    if (i + 1 != contents.data.length) {
      x += (i + 1).toString()
    } else {
      x += "0"
    }
    x += "\"\n"

    // finally apply the alias to the response
    response += x;
  }

  // write the config file
  fs.writeFileSync('output.cfg', response)
  return Promise.resolve()
})
.catch(SyntaxError, function (e) {
  console.error("invalid json in file");
})
.catch(function (e) {
  if (!hasConfigFile) {
    let configContents = {
      "alias": "",
      "key": "",
      "data": [
        ""
      ]
    }
    fs.writeFileSync('input.json', JSON.stringify(configContents, null, 2))
  } else {
    console.log(e)
  }
})
