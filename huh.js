// webpack helper
export default class huh {
  static eh(tag, data, ...children) {
    let el = document.createElement(tag);
    if('h-i18' in data) {
      I18n.register(data['h-i18'], el);
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

// DISPATCHER

let _pinstance = null

export class Sub {
  constructor(type, data) {
    this.type = type
    this.data = data
  }
}

export class Pub {
  constructor() {
    if(_pinstance) {
      throw new Error('Pub is Singleton')
    } else {
      this.listeners = {}
      this.once = {}
      _pinstance = this
    }
  }

  static instance() {
    if (!_pinstance) _pinstance = new Pub()
    return _pinstance
  }

  watch (type, callback, once) {
    console.log('pub watch', type, once)
    if (!(type in this.listeners)) {
      this.listeners[type] = []
    }
    this.listeners[type].push(callback)
    if(once) {
      this.once[callback] = true;
    }
    return true
  }

  unwatch (type, callback) {
    console.log('pub unwatch', type)
    if (!(type in this.listeners)) {
      return true
    }
    const stack = this.listeners[type]
    for (let i = 0, l = stack.length; i < l; i++) {
      if (stack[i] === callback){
        stack.splice(i, 1)
        return true
      }
    }
    return false
  }

  send (event) {
    // console.log('pub event', event)
    if (!(event.type in this.listeners)) {
      return true
    }
    var stack = this.listeners[event.type]
    event.target = this
    const toRemove = []
    for (let i = 0, l = stack.length; i < l; i++) {
      stack[i].call(this, event)
      if(stack[i] in this.once) {
        toRemove.push(i);
      }
    }
    // remove once listeners
    for (let i = 0, l = toRemove.length; i < l; i++) {
      stack.splice(toRemove[i], 1)
    }
    return !event.defaultPrevented
  }

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
    if(!key in this._data) throw new Error(`Invalid key ${key}`)
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

export class Cmd {
  constructor(event) {
    this.event = event
  }
  execute() {
  }
}

export class CmdFacade {
  constructor() {
    this.registry = {}
    this.listeners = {}
    this.pub = Pub.instance()
  }

  register(eventName, cmd) {
    if(eventName in this.registry) {
      throw new Error(`${eventName} already in Facade`)
    }
    this.registry[eventName] = cmd
    const listener = (e) => {
      new this.registry[eventName](e).execute()
    }
    this.pub.watch(eventName, listener)
  }

  unregister(eventName) {
    this.pub.unwatch(eventName, this.listeners[eventName])
    delete this.listeners[eventName]
    delete this.registry[eventName]
  }
}

const _i18comp = {};
const _i18langs = {};

export class I18 {

  static registerLanguage(lang, data) {
    if(key in _i18langs) {
      throw Error(`Duplicate key ${key}`);
    }
    _i18langs[lang] = data;
  }

  static switchLanguage(lang) {
    if(!lang in _i18langs) {
      throw Error(`Language not found ${lang}`);
    }
    const data = _i18langs[lang].data
    for(let key in _i18comp) {
      I18.t(_i18comp[key], data[key]);
    }
  }

  static register(key, el) {
    if(key in _i18ncomp) {
      throw Error(`Duplicate key ${key}`);
    }
    _i18ncomp[key] = el;
  }

  static t(el, data) {
    if(typeof data == "string" || typeof data == "number") {
      el.innerText = translation;
    } else {
      throw Error(`TODO implement dynamic data type ${data}`);
    }
  }
}
