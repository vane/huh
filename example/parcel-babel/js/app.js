import huh, {Random, I18, HFacade, HEvent, HCtrl, HInjection, HModel} from '@szczepano/huh'

// I18n
I18.registerLanguage('en', {
    path:'assets/i18/en.x'
});
I18.registerLanguage('pl', {
    path:'assets/i18/pl.x'
});

// View

class HelloView {
    render() {
        return <h1 h-i18="h1.hello">Hello</h1>
    }
}

class AlertButtonView {
    render() {
        return <button h-i18="test.btn" h-ctrl="alert.button">Click me!</button>
    }
}

class LanguageButton {
    constructor(language) {
        this.language = language
    }
    render() {
        return <button h-ctrl="language.button">{this.language}</button>
    }
}

const start = () => {
    const arr = ['w','o','r','l','d']
    const components = [];
    arr.forEach((el) => {
        components.push(<span>{el}</span>)
    })
    const langs = []
    new Array('en', 'pl').forEach((l, i) => {
        langs.push(new LanguageButton(l));
    })
    return (<div>
        <div>
            <label h-i18="language.label">Language:</label>
            {langs}
        </div>
        {new HelloView()}
        {components}
        <br />
        {new AlertButtonView()}
        {new AlertButtonView()}
    </div>)
}

// model
class AlertButtonModel extends HModel {
    constructor () {
        super({
            'click.count': 0,
        })
    }
}

// controller
HCtrl.add('language.button', null, [
  new HInjection('click', (e) => {
      I18.switchLanguage(e.target.innerText);
  }),
]);
HCtrl.add('alert.button', new AlertButtonModel(), [
  new HInjection('click', () => {
      dispatchEvent(new HEvent('alert.hi'));
  }),
]);

// command
const AlertHiCmd = () => {
    const model = HCtrl.model('alert.button');
    const count = model.get('click.count');
    model.set('click.count', count + 1);
    alert(I18.getKey('alert.hi', model));
}
HFacade.register('alert.hi', AlertHiCmd);
I18.loadLanguage('en');
document.getElementById('main').appendChild(start())
