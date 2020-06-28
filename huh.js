// webpack helper
export default class huh {
  static eh(tag, data, ...children) {
    let el = document.createElement(tag);
    if(data && 'h-i18' in data) {
      I18.register(data['h-i18'], el);
    }
    for(let arg in data) {
      if(typeof data[arg] == "function") {
        el[arg] = data[arg];
      } else {
        el.setAttribute(arg, data[arg]);
      }
    }
    let add = (el, children) => {
      for(let ch of children) {
        if(ch && ch.nodeType) {
          el.appendChild(ch)
        } else if(typeof ch == "string" || typeof ch == "number") {
          el.appendChild(document.createTextNode(ch));
        } else if(ch && ch.length) {
          add(el, ch);
        } else if (typeof ch == "object") {
          el.appendChild(ch.render())
        }
      }
    }
    add(el, children);
    return el;
  }
}

// HTTP

export const HTTP = (o) => {
  /**
   * @param o -
   * o.method - GET,POST,PUT,DELETE
   * o.data - data to pass
   * o.url = http or https
   * o.type - 'Content-type'
   * o.headers - headers = [{header:'h', value:'v'},...,]
   * o.auth - username, password - basic authentication - auth = {username:'name', password:'pass'}
   * @param success - success callback
   * @param error - error callback
   */
  const req = new XMLHttpRequest();
  if (!req) alert('request create problem');

  var method = o.method ? o.method : "GET";
  o.auth ? req.open(method, o.url, true, o.auth.username, o.auth.password) : req.open(method, o.url, true);

  req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

  if (o.headers) {
    for (let i = 0; i < o.headers.length; i++) {
      const h = o.headers[i];
      req.setRequestHeader(h.header, h.value);
    }
  }

  if (o.type) {
    req.setRequestHeader('Content-type', o.type);
  }

  console.log(o.url);
  req.send(o.data);
  return new Promise((success, failure) => {
    req.onreadystatechange = function () {
      if (req.readyState != 4) return;
      if (req.status != 200 && req.status != 304) {
        if (failure) failure({ status: req.status, data: req.response, text: req.statusText, request: req });
      } else {
        if (success) success({ status: req.status, data: req.response, text: req.statusText, request: req });
      }
      req.onreadystatechange = null;
    };
  });
}

// Model
let _minstance = null

export class Model {
  constructor() {
    if(_minstance) {
      throw new Error('Model is Singleton')
    } else {
      this._data = {}
      this._pub = Pub.instance()
      _minstance = this
    }
  }

  set(key, value) {
    this._data[key] = value
    this._pub.send(new Sub(`model.${key}`, {type:'set', value}))
  }

  get(key) {
    return this._data[key]
  }

  update(key, value) {
    if(!(key in this._data)) throw new Error(`Invalid key ${key}`)
    this._data[key] = value
    this._pub.send(new Sub(`model.${key}`, {type:'update', value}))
  }

  del(key) {
    delete this._data[key]
    this._pub.send(new Sub(`model.${key}`, {type:'del', value}))
  }

  static instance() {
    if (!_minstance) _minstance = new Model()
    return _minstance
  }
}

export class Random {
  static intRange(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  static pickArraySize(arr, size) {
    const a = arr.slice()
    const out = []
    for (let i = 0;i<size;i++) {
      const el = a.splice(Random.intRange(0, a.length - 1), 1)
      out.push(el[0])
    }
    return out
  }

  static shuffle(array) {
    const a = array.slice()
    const out = []
    while(a.length > 0) {
      const idx = Math.floor(Math.random() * a.length - 1);
      out.push(a.splice(idx, 1)[0])
    }
    return out
  }
}

// Event -> Command pattern

export class HEvent extends Event{
  constructor(type, data) {
    super(type);
    this.data = data;
  }
}

const _hlisteners = {};

class CmdWrapper {
  constructor(cmd, once, chain) {
    this.cmd = cmd;
    this.once = once;
    this.chain = chain;
    this.handler = (e) => {
      this.cmd();
      if(this.once) {
        delete _hlisteners[e.type];
        removeEventListener(e.type, this.handler);
      }
      if(this.chain) {
        this.chain.forEach((cmd) => {
          cmd(e);
        });
      }
    }
  }
}

export class HFacade {

  static register(name, cmd, once, chain) {
    if(name in _hlisteners) {
      throw new Error(`${name} already in HFacade`)
    }
    _hlisteners[name] = new CmdWrapper(cmd, once, chain);
    addEventListener(name, _hlisteners[name].handler);
  }
}

const _i18comp = {};
const _i18langs = {};
let _currentLanguage = null;

export class I18 {

  static language() {
    return _currentLanguage;
  }

  static registerLanguage(lang, data) {
    if(lang in _i18langs) {
      throw Error(`Duplicate key ${lang}`);
    }
    _i18langs[lang] = data;
  }

  static switchLanguage(lang) {
    if(!(lang in _i18langs)) {
      throw Error(`Language not found ${lang}`);
    }
    _currentLanguage = lang;
    const data = _i18langs[lang].data;
    for(let key in _i18comp) {
      if(!(key in data)) {
        console.warn(`Missing translation for language "${lang}" key: "${key}" setting current value`);
        _i18langs[lang].data[key] = _i18comp[key].innerText;
      } else {
        I18.t(_i18comp[key], data[key]);
      }
    }
  }

  static register(key, el) {
    if(key in _i18comp) {
      throw Error(`Duplicate key ${key}`);
    }
    _i18comp[key] = el;
  }

  static t(el, data) {
    if(typeof data == "string" || typeof data == "number") {
      el.innerText = data;
    } else {
      throw Error(`TODO implement dynamic data type ${data}`);
    }
  }

  static getKey(key) {
    return _i18langs[_currentLanguage].data[key];
  }

  static getLKey(lang, key) {
    if(!(lang in _i18langs)) {
      throw Error(`Language not found ${lang}`);
    }
    return _i18langs[lang].data[key];
  }
}
