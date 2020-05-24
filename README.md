huh ?
====

#### Minimalistic jsx like syntax framework  
```
import huh from 'huh'

class Hello {
    render() {
        return <h1>Hello</h1>
    }
}

const start = () => {
    const title = new Hello()
    const arr = ['w','o','r','l','d']
    const components = [] 
    arr.forEach((el) => {
        components.push(<span>{el}</span>)
    })
    const handleClick = () => {
        alert('hi')
    }
    const btn = <button onclick={handleClick}></button>
    return (<div>
        {title}
        {components}
        <br /> 
        {btn}
    </div>)
}
document.getElementById('main').appendChild(start())
```  

#### TODO 
merge with this repo  
* [ ] i18n  
* [ ] history
* [ ] command / facade workflow  

add example  
* [ ] http
* [ ] publish / subscribe 
* [ ] model 
* [ ] random 
