// Generated by CoffeeScript 1.3.3
(function() {
  var Github, encode, err, jQuery, makeGithub, najax, _,
    _this = this,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  makeGithub = function(_, jQuery, base64encode, userAgent) {
    var Github;
    Github = (function() {
      var AuthenticatedUser, Branch, Gist, GitRepo, Repository, User, _listeners, _request;

      _request = null;

      _listeners = [];

      function Github(options) {
        if (options == null) {
          options = {};
        }
        options.rootURL = options.rootURL || 'https://api.github.com';
        _request = function(method, path, data, raw, isBase64) {
          var auth, getURL, headers, mimeType, xhr,
            _this = this;
          getURL = function() {
            var url;
            url = options.rootURL + path;
            return url + (/\?/.test(url) ? '&' : '?') + (new Date()).getTime();
          };
          mimeType = void 0;
          if (isBase64) {
            mimeType = 'text/plain; charset=x-user-defined';
          }
          headers = {
            'Accept': 'application/vnd.github.raw'
          };
          if (userAgent) {
            headers['User-Agent'] = userAgent;
          }
          if ((options.auth === 'oauth' && options.token) || (options.auth === 'basic' && options.username && options.password)) {
            if (options.auth === 'oauth') {
              auth = "token " + options.token;
            } else {
              auth = 'Basic ' + base64encode("" + options.username + ":" + options.password);
            }
            headers['Authorization'] = auth;
          }
          xhr = jQuery.ajax({
            url: getURL(),
            type: method,
            contentType: 'application/json',
            mimeType: mimeType,
            headers: headers,
            processData: false,
            data: !raw && data && JSON.stringify(data) || data,
            dataType: !raw ? 'json' : void 0
          });
          return xhr.always(function() {
            var listener, rateLimit, rateLimitRemaining, _i, _len, _results;
            rateLimit = parseFloat(xhr.getResponseHeader('X-RateLimit-Limit'));
            rateLimitRemaining = parseFloat(xhr.getResponseHeader('X-RateLimit-Remaining'));
            _results = [];
            for (_i = 0, _len = _listeners.length; _i < _len; _i++) {
              listener = _listeners[_i];
              _results.push(listener(rateLimitRemaining, rateLimit, method, path, data, raw, isBase64));
            }
            return _results;
          }).then(function(data, textStatus, jqXHR) {
            var converted, i, ret, _i, _ref;
            ret = new jQuery.Deferred();
            if ('GET' === method && isBase64) {
              converted = '';
              for (i = _i = 0, _ref = data.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
                converted += String.fromCharCode(data.charCodeAt(i) & 0xff);
              }
              converted;

              return ret.resolve(converted, textStatus, jqXHR);
            } else {
              return ret.resolve(data, textStatus, jqXHR);
            }
          }).then(null, function(xhr, msg, desc) {
            var json;
            if (xhr.getResponseHeader('Content-Type') !== 'application/json; charset=utf-8') {
              return {
                error: xhr.responseText,
                status: xhr.status,
                _xhr: xhr
              };
            }
            json = JSON.parse(xhr.responseText);
            return {
              error: json,
              status: xhr.status,
              _xhr: xhr
            };
          }).promise();
        };
      }

      Github.prototype.onRateLimitChanged = function(listener) {
        return _listeners.push(listener);
      };

      Github.prototype.getZen = function() {
        return _request('GET', '/zen', null, true);
      };

      Github.prototype.getOrgRepos = function(orgName) {
        return _request('GET', "/orgs/" + orgName + "/repos?type=all&per_page=1000&sort=updated&direction=desc", null);
      };

      Github.prototype.getPublicGists = function(since) {
        var getDate, options;
        if (since == null) {
          since = null;
        }
        options = null;
        getDate = function(time) {
          if (Date === time.constructor) {
            return time.toISOString();
          }
          return time;
        };
        if (since) {
          options = {
            since: getDate(since)
          };
        }
        return _request('GET', '/gists/public', options);
      };

      Github.prototype.getPublicEvents = function() {
        return _request('GET', '/events', null);
      };

      Github.prototype.getNotifications = function(options) {
        var getDate;
        if (options == null) {
          options = {};
        }
        getDate = function(time) {
          if (Date === time.constructor) {
            return time.toISOString();
          }
          return time;
        };
        if (options.since) {
          options.since = getDate(options.since);
        }
        return _request('GET', '/notifications', options);
      };

      User = (function() {
        var _rootPath, _username;

        _rootPath = null;

        _username = null;

        function User(username) {
          if (username == null) {
            username = null;
          }
          _username = username;
          if (username) {
            _rootPath = "/users/" + username;
          } else {
            _rootPath = "/user";
          }
        }

        User.prototype.getInfo = function() {
          return _request('GET', "" + _rootPath, null);
        };

        User.prototype.getRepos = function() {
          return _request('GET', "" + _rootPath + "/repos?type=all&per_page=1000&sort=updated", null);
        };

        User.prototype.getOrgs = function() {
          return _request('GET', "" + _rootPath + "/orgs", null);
        };

        User.prototype.getGists = function() {
          return _request('GET', "" + _rootPath + "/gists", null);
        };

        User.prototype.getFollowers = function() {
          return _request('GET', "" + _rootPath + "/followers", null);
        };

        User.prototype.getFollowing = function() {
          return _request('GET', "" + _rootPath + "/following", null);
        };

        User.prototype.getReceivedEvents = function(onlyPublic) {
          var isPublic;
          if (!_username) {
            throw 'BUG: This does not work for authenticated users yet!';
          }
          isPublic = '';
          if (onlyPublic) {
            isPublic = '/public';
          }
          return _request('GET', "/users/" + _username + "/received_events" + isPublic, null);
        };

        User.prototype.getEvents = function(onlyPublic) {
          var isPublic;
          if (!_username) {
            throw 'BUG: This does not work for authenticated users yet!';
          }
          isPublic = '';
          if (onlyPublic) {
            isPublic = '/public';
          }
          return _request('GET', "/users/" + _username + "/events" + isPublic, null);
        };

        return User;

      })();

      AuthenticatedUser = (function(_super) {

        __extends(AuthenticatedUser, _super);

        function AuthenticatedUser() {
          return AuthenticatedUser.__super__.constructor.apply(this, arguments);
        }

        AuthenticatedUser.prototype.getGists = function() {
          return _request('GET', '/gists', null);
        };

        AuthenticatedUser.prototype.follow = function(username) {
          return _request('PUT', "/user/following/" + username, null);
        };

        AuthenticatedUser.prototype.unfollow = function(username) {
          return _request('DELETE', "/user/following/" + username, null);
        };

        return AuthenticatedUser;

      })(User);

      GitRepo = (function() {
        var _currentTree, _repoPath;

        _repoPath = null;

        _currentTree = {
          branch: null,
          sha: null
        };

        function GitRepo(repoUser, repoName) {
          this.repoUser = repoUser;
          this.repoName = repoName;
          _repoPath = "/repos/" + this.repoUser + "/" + this.repoName;
        }

        GitRepo.prototype._updateTree = function(branch) {
          var _this = this;
          if (branch === _currentTree.branch && _currentTree.sha) {
            return (new jQuery.Deferred()).resolve(_currentTree.sha);
          }
          return this.getRef("heads/" + branch).then(function(sha) {
            _currentTree.branch = branch;
            _currentTree.sha = sha;
            return sha;
          }).promise();
        };

        GitRepo.prototype.getRef = function(ref) {
          var _this = this;
          return _request('GET', "" + _repoPath + "/git/refs/" + ref, null).then(function(res) {
            return res.object.sha;
          }).promise();
        };

        GitRepo.prototype.createRef = function(options) {
          return _request('POST', "" + _repoPath + "/git/refs", options);
        };

        GitRepo.prototype.deleteRef = function(ref) {
          return _request('DELETE', "" + _repoPath + "/git/refs/" + ref, this.options);
        };

        GitRepo.prototype.getBranches = function() {
          var _this = this;
          return _request('GET', "" + _repoPath + "/git/refs/heads", null).then(function(heads) {
            return _.map(heads, function(head) {
              return _.last(head.ref.split("/"));
            });
          }).promise();
        };

        GitRepo.prototype.getBlob = function(sha, isBase64) {
          return _request('GET', "" + _repoPath + "/git/blobs/" + sha, null, 'raw', isBase64);
        };

        GitRepo.prototype.getSha = function(branch, path) {
          var _this = this;
          if (path === '') {
            return this.getRef("heads/" + branch);
          }
          return this.getTree("" + branch + "?recursive=true").then(function(tree) {
            var file;
            file = _.select(tree, function(file) {
              return file.path === path;
            })[0];
            if (file != null ? file.sha : void 0) {
              return file != null ? file.sha : void 0;
            }
            return (new jQuery.Deferred()).reject({
              message: 'SHA_NOT_FOUND'
            });
          }).promise();
        };

        GitRepo.prototype.getTree = function(tree) {
          var _this = this;
          return _request('GET', "" + _repoPath + "/git/trees/" + tree, null).then(function(res) {
            return res.tree;
          }).promise();
        };

        GitRepo.prototype.postBlob = function(content, isBase64) {
          var _this = this;
          if (typeof content === 'string') {
            content = {
              content: content,
              encoding: 'utf-8'
            };
          }
          if (isBase64) {
            content.encoding = 'base64';
          }
          return _request('POST', "" + _repoPath + "/git/blobs", content).then(function(res) {
            return res.sha;
          }).promise();
        };

        GitRepo.prototype.updateTree = function(baseTree, path, blob) {
          var data,
            _this = this;
          data = {
            base_tree: baseTree,
            tree: [
              {
                path: path,
                mode: '100644',
                type: 'blob',
                sha: blob
              }
            ]
          };
          return _request('POST', "" + _repoPath + "/git/trees", data).then(function(res) {
            return res.sha;
          }).promise();
        };

        GitRepo.prototype.postTree = function(tree) {
          var _this = this;
          return _request('POST', "" + _repoPath + "/git/trees", {
            tree: tree
          }).then(function(res) {
            return res.sha;
          }).promise();
        };

        GitRepo.prototype.commit = function(parent, tree, message) {
          var data,
            _this = this;
          data = {
            message: message,
            author: {
              name: this.options.username
            },
            parents: [parent],
            tree: tree
          };
          return _request('POST', "" + _repoPath + "/git/commits", data).then(function(res) {
            _currentTree.sha = res.sha;
            return res.sha;
          }).promise();
        };

        GitRepo.prototype.updateHead = function(head, commit) {
          return _request('PATCH', "" + _repoPath + "/git/refs/heads/" + head, {
            sha: commit
          });
        };

        GitRepo.prototype.getCommits = function(options) {
          var getDate, params, queryString;
          if (options == null) {
            options = {};
          }
          options = _.extend({}, options);
          getDate = function(time) {
            if (Date === time.constructor) {
              return time.toISOString();
            }
            return time;
          };
          if (options.since) {
            options.since = getDate(options.since);
          }
          if (options.until) {
            options.until = getDate(options.until);
          }
          queryString = '';
          if (!_.isEmpty(options)) {
            params = [];
            _.each(_.pairs(options), function(_arg) {
              var key, value;
              key = _arg[0], value = _arg[1];
              return params.push("" + key + "=" + (encodeURIComponent(value)));
            });
            queryString = "?" + (params.join('&'));
          }
          return _request('GET', "" + _repoPath + "/commits" + queryString, null).promise();
        };

        return GitRepo;

      })();

      Branch = (function() {
        var _getRef, _git;

        _git = null;

        _getRef = function() {
          throw 'BUG: No way to fetch branch ref!';
        };

        function Branch(git, getRef) {
          _git = git;
          _getRef = getRef;
        }

        Branch.prototype.getCommits = function(options) {
          if (options == null) {
            options = {};
          }
          options = _.extend({}, options);
          return _getRef().then(function(branch) {
            options.sha = branch;
            return _git.getCommits(options);
          }).promise();
        };

        Branch.prototype.read = function(path, isBase64) {
          var _this = this;
          return _getRef().then(function(branch) {
            return _git.getSha(branch, path).then(function(sha) {
              return _git.getBlob(sha, isBase64);
            });
          }).promise();
        };

        Branch.prototype.remove = function(path, message) {
          var _this = this;
          if (message == null) {
            message = "Removed " + path;
          }
          return _getRef().then(function(branch) {
            return _git._updateTree(branch).then(function(latestCommit) {
              return _git.getTree("" + latestCommit + "?recursive=true").then(function(tree) {
                var newTree;
                newTree = _.reject(tree, function(ref) {
                  return ref.path === path;
                });
                _.each(newTree, function(ref) {
                  if (ref.type === 'tree') {
                    return delete ref.sha;
                  }
                });
                return _git.postTree(newTree).then(function(rootTree) {
                  return _git.commit(latestCommit, rootTree, message).then(function(commit) {
                    return _git.updateHead(branch, commit).then(function(res) {
                      return res;
                    });
                  });
                });
              });
            });
          }).promise();
        };

        Branch.prototype.move = function(path, newPath, message) {
          var _this = this;
          if (message == null) {
            message = "Moved " + path;
          }
          return _getRef().then(function(branch) {
            return _git._updateTree(branch).then(function(latestCommit) {
              return _git.getTree("" + latestCommit + "?recursive=true").then(function(tree) {
                _.each(tree, function(ref) {
                  if (ref.path === path) {
                    ref.path = newPath;
                  }
                  if (ref.type === 'tree') {
                    return delete ref.sha;
                  }
                });
                return _git.postTree(tree).then(function(rootTree) {
                  return _git.commit(latestCommit, rootTree, message).then(function(commit) {
                    return _git.updateHead(branch, commit).then(function(res) {
                      return res;
                    });
                  });
                });
              });
            });
          }).promise();
        };

        Branch.prototype.write = function(path, content, message, isBase64) {
          var _this = this;
          if (message == null) {
            message = "Changed " + path;
          }
          return _getRef().then(function(branch) {
            return _git._updateTree(branch).then(function(latestCommit) {
              return _git.postBlob(content, isBase64).then(function(blob) {
                return _git.updateTree(latestCommit, path, blob).then(function(tree) {
                  return _git.commit(latestCommit, tree, message).then(function(commit) {
                    return _git.updateHead(branch, commit).then(function(res) {
                      return res;
                    });
                  });
                });
              });
            });
          }).promise();
        };

        return Branch;

      })();

      Repository = (function() {
        var _repo, _user;

        _user = null;

        _repo = null;

        function Repository(options) {
          this.options = options;
          _user = this.options.user;
          _repo = this.options.name;
          this.git = new GitRepo(_user, _repo);
          this.repoPath = "/repos/" + _user + "/" + _repo;
          this.currentTree = {
            branch: null,
            sha: null
          };
        }

        Repository.prototype.getBranches = function() {
          return this.git.getBranches();
        };

        Repository.prototype.getBranch = function(branchName) {
          var getRef,
            _this = this;
          getRef = function() {
            var deferred;
            deferred = new jQuery.Deferred();
            deferred.resolve(branchName);
            return deferred;
          };
          return new Branch(this.git, getRef);
        };

        Repository.prototype.getDefaultBranch = function() {
          var getRef,
            _this = this;
          getRef = function() {
            return _this.getInfo().then(function(info) {
              return info.master_branch;
            });
          };
          return new Branch(this.git, getRef);
        };

        Repository.prototype.getInfo = function() {
          return _request('GET', this.repoPath, null);
        };

        Repository.prototype.contents = function(branch, path) {
          return _request('GET', "" + this.repoPath + "/contents?ref=" + branch, {
            path: path
          });
        };

        Repository.prototype.fork = function() {
          return _request('POST', "" + this.repoPath + "/forks", null);
        };

        Repository.prototype.createPullRequest = function(options) {
          return _request('POST', "" + this.repoPath + "/pulls", options);
        };

        Repository.prototype.getCommits = function(options) {
          return this.git.getCommits(options);
        };

        Repository.prototype.getEvents = function() {
          return _request('GET', "" + this.repoPath + "/events", null);
        };

        Repository.prototype.getIssueEvents = function() {
          return _request('GET', "" + this.repoPath + "/issues/events", null);
        };

        Repository.prototype.getNetworkEvents = function() {
          return _request('GET', "/networks/" + _owner + "/" + _repo + "/events", null);
        };

        Repository.prototype.getNotifications = function(options) {
          var getDate;
          if (options == null) {
            options = {};
          }
          getDate = function(time) {
            if (Date === time.constructor) {
              return time.toISOString();
            }
            return time;
          };
          if (options.since) {
            options.since = getDate(options.since);
          }
          return _request('GET', "" + this.repoPath + "/notifications", options);
        };

        return Repository;

      })();

      Gist = (function() {

        function Gist(options) {
          var id;
          this.options = options;
          id = this.options.id;
          this.gistPath = "/gists/" + id;
        }

        Gist.prototype.read = function() {
          return _request('GET', this.gistPath, null);
        };

        Gist.prototype.create = function(files, isPublic, description) {
          var options;
          if (isPublic == null) {
            isPublic = false;
          }
          if (description == null) {
            description = null;
          }
          options = {
            isPublic: isPublic,
            files: files
          };
          if (description != null) {
            options.description = description;
          }
          return _request('POST', "/gists", options);
        };

        Gist.prototype["delete"] = function() {
          return _request('DELETE', this.gistPath, null);
        };

        Gist.prototype.fork = function() {
          return _request('POST', "" + this.gistPath + "/forks", null);
        };

        Gist.prototype.update = function(files, description) {
          var options;
          if (description == null) {
            description = null;
          }
          options = {
            files: files
          };
          if (description != null) {
            options.description = description;
          }
          return _request('PATCH', this.gistPath, options);
        };

        Gist.prototype.star = function() {
          return _request('PUT', "" + this.gistPath + "/star");
        };

        Gist.prototype.unstar = function() {
          return _request('DELETE', "" + this.gistPath + "/star");
        };

        Gist.prototype.isStarred = function() {
          return _request('GET', "" + this.gistPath);
        };

        return Gist;

      })();

      Github.prototype.getRepo = function(user, repo) {
        return new Repository({
          user: user,
          name: repo
        });
      };

      Github.prototype.getUser = function(username) {
        if (username == null) {
          username = null;
        }
        if (username) {
          return new User(username);
        } else {
          return new AuthenticatedUser();
        }
      };

      Github.prototype.getGist = function(id) {
        return new Gist({
          id: id
        });
      };

      return Github;

    })();
    return Github;
  };

  if (typeof exports !== "undefined" && exports !== null) {
    _ = require('underscore');
    jQuery = require('jquery-deferred');
    najax = require('najax');
    jQuery.ajax = najax;
    encode = function(str) {
      var buffer;
      buffer = new Buffer(str, 'binary');
      return buffer.toString('base64');
    };
    Github = makeGithub(_, jQuery, encode, 'github-client');
    exports["new"] = function(options) {
      return new Github(options);
    };
  } else if (this.define != null) {
    if (this.btoa) {
      this.define('github', ['underscore', 'jquery'], function(_, jQuery) {
        return makeGithub(_, jQuery, this.btoa);
      });
    } else {
      this.define('github', ['underscore', 'jquery', 'base64'], function(_, jQuery, Base64) {
        return makeGithub(_, jQuery, Base64.encode);
      });
    }
  } else if (this._ && this.jQuery && (this.btoa || this.Base64)) {
    encode = this.btoa || this.Base64.encode;
    this.Github = makeGithub(this._, this.jQuery, encode);
  } else {
    err = function(msg) {
      if (typeof console !== "undefined" && console !== null) {
        if (typeof console.error === "function") {
          console.error(msg);
        }
      }
      throw msg;
    };
    if (!this._) {
      err('Underscore not included');
    }
    if (!this.jQuery) {
      err('jQuery not included');
    }
    if (!this.Base64 && !this.btoa) {
      err('Base64 not included');
    }
  }

}).call(this);
