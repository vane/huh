import huh, {Random, I18} from '@szczepano/huh'

class Hello {
    render() {
        return <h1 h-i18="h1.hello">Hello</h1>
    }
}

const start = () => {
    const title = new Hello()
    const arr = ['w','o','r','l','d']
    const components = []
    console.log(Random.intRange(0, 10))
    arr.forEach((el) => {
        components.push(<span>{el}</span>)
    })
    I18.registerLanguage('en', {
        data: {
            'alert.hi': 'hi',
        }
    })
    I18.registerLanguage('pl', {
        data: {
            'test.btn':'Kliknij!',
            'language.label': 'Język:',
            'h1.hello': 'Witaj',
            'alert.hi': 'Cześć',
        }
    })
    const handleClick = () => {
        alert(I18.getKey('alert.hi'))
    }
    const handleLanguageClick = (e) => {
        I18.switchLanguage(e.target.innerText);
    }
    const btn = <button h-i18="test.btn" onclick={handleClick}>Click me!</button>
    const langs = ['en', 'pl']
    langs.forEach((l, i) => {
        langs[i] = <button onclick={handleLanguageClick}>{l}</button>
    })
    return (<div>
        <div>
            <label h-i18="language.label">Language:</label>{langs}
        </div>
        {title}
        {components}
        <br />
        {btn}
    </div>)
}
document.getElementById('main').appendChild(start())
// hack to assign data to all components
I18.switchLanguage('en');
